package com.hypervoice.ime

import android.content.Intent
import android.graphics.Typeface
import android.inputmethodservice.InputMethodService
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputConnection
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import com.hypervoice.R
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale
import kotlin.math.max

class AiVoiceKeyboardService : InputMethodService() {
    private var speechRecognizer: SpeechRecognizer? = null
    private lateinit var statusText: TextView
    private lateinit var previewText: TextView
    private lateinit var keyboardPanel: LinearLayout
    private lateinit var voicePanel: LinearLayout
    private lateinit var keyboardRows: LinearLayout
    private lateinit var voiceToggleButton: Button
    private lateinit var languageToggleButton: Button
    private var waveContainer: View? = null
    private var waveBars: List<View> = emptyList()
    private var animatorSet: android.animation.AnimatorSet? = null
    private var finalText: String = ""
    private var isVoiceMode = false
    private var languageIndex = 0
    private var selectedMode = "cleanup"
    private val mainHandler = Handler(Looper.getMainLooper())
    private var isShifted = true
    private var isEmoji = false
    private var speechStartTime: Long = 0L
    private var cachedInputConnection: InputConnection? = null
    private var isListening = false
    private var lastRmsLevel = 0f

    private val languageValues = listOf("en-US", "bn-BD", "hi-IN")
    private val languageLabels = listOf("EN", "BN", "HI")
    private val letterRows = listOf(
        listOf("Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"),
        listOf("A", "S", "D", "F", "G", "H", "J", "K", "L"),
        listOf("shift", "Z", "X", "C", "V", "B", "N", "M", "backspace"),
        listOf("123", "😊", "space", "return")
    )
    private val symbolRows = listOf(
        listOf("1", "2", "3", "4", "5", "6", "7", "8", "9", "0"),
        listOf("@", "#", "$", "&", "*", "(", ")", "'", "\""),
        listOf("ABC", "-", "/", ":", ";", ",", ".", "?", "backspace"),
        listOf("123", "😊", "space", "return")
    )
    private val emojiRows = listOf(
        listOf("😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇"),
        listOf("🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚"),
        listOf("😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩"),
        listOf("ABC", "space", "return")
    )
    private var isSymbols = false

    override fun onStartInput(attribute: EditorInfo?, restarting: Boolean) {
        super.onStartInput(attribute, restarting)
        cachedInputConnection = currentInputConnection
    }

    override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(info, restarting)
        cachedInputConnection = currentInputConnection
    }

    override fun onCreateInputView(): View {
        val view = LayoutInflater.from(this).inflate(R.layout.keyboard_view, null)
        statusText = view.findViewById(R.id.statusText)
        previewText = view.findViewById(R.id.previewText)
        keyboardPanel = view.findViewById(R.id.keyboardPanel)
        voicePanel = view.findViewById(R.id.voicePanel)
        keyboardRows = view.findViewById(R.id.keyboardRows)
        voiceToggleButton = view.findViewById(R.id.voiceToggleButton)
        languageToggleButton = view.findViewById(R.id.languageToggleButton)
        waveContainer = view.findViewById(R.id.waveContainer)
        val wb1 = view.findViewById<View>(R.id.waveBar1)
        val wb2 = view.findViewById<View>(R.id.waveBar2)
        val wb3 = view.findViewById<View>(R.id.waveBar3)
        val wb4 = view.findViewById<View>(R.id.waveBar4)
        val wb5 = view.findViewById<View>(R.id.waveBar5)
        waveBars = listOfNotNull(wb1, wb2, wb3, wb4, wb5)

        restoreDefaults()
        buildKeyboard()
        showKeyboardMode()

        voiceToggleButton.setOnClickListener { toggleVoiceMode() }
        languageToggleButton.setOnClickListener { cycleLanguage() }
        view.findViewById<View>(R.id.micButton).setOnClickListener { startListening() }
        view.findViewById<Button>(R.id.returnButton).setOnClickListener { commitReturn() }
        view.findViewById<Button>(R.id.voiceBackspaceButton).setOnClickListener { backspace() }
        view.findViewById<Button>(R.id.hideKeyboardButton).setOnClickListener { requestHideSelf(0) }
        return view
    }

    private fun restoreDefaults() {
        val prefs = getSharedPreferences("hypervoice_keyboard", MODE_PRIVATE)
        val language = prefs.getString("defaultLanguage", "en-US") ?: "en-US"
        selectedMode = prefs.getString("defaultMode", "cleanup") ?: "cleanup"
        languageIndex = languageValues.indexOf(language).coerceAtLeast(0)
        languageToggleButton.text = languageLabels[languageIndex]
    }

    private fun buildKeyboard() {
        keyboardRows.removeAllViews()
        val rows = when {
            isEmoji -> emojiRows
            isSymbols -> symbolRows
            else -> letterRows
        }
        for ((rowIndex, row) in rows.withIndex()) {
            val rowView = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER
                setPadding(if (rowIndex == 1 && !isEmoji) 24 else 0, 8, if (rowIndex == 1 && !isEmoji) 24 else 0, 8)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
            }
            for (key in row) {
                rowView.addView(createKey(key))
            }
            keyboardRows.addView(rowView)
        }
    }

    private fun isLetter(key: String): Boolean {
        return key.length == 1 && key[0] in 'A'..'Z'
    }

    private fun createKey(key: String): Button {
        val isSpace = key == "space"
        val isReturn = key == "return"
        val isSpecial = key == "shift" || key == "backspace" || key == "123" || key == "ABC" || key == "😊"
        val label = when (key) {
            "shift" -> "⇧"
            "backspace" -> "⌫"
            "space" -> languageLabels[languageIndex]
            "return" -> "↩"
            else -> key
        }

        val displayLabel = if (isSpecial || isReturn || isSpace) {
            label
        } else if (isLetter(key)) {
            if (isShifted) key.uppercase() else key.lowercase()
        } else {
            key
        }

        return Button(this).apply {
            text = displayLabel
            textSize = if (isSpecial || isReturn) 17f else 22f
            typeface = Typeface.DEFAULT
            isAllCaps = false
            minWidth = 0
            minHeight = 0
            setPadding(0, 0, 0, 0)
            setTextColor(if (isReturn) 0xFFFFFFFF.toInt() else 0xFF111111.toInt())
            setBackgroundResource(when {
                isReturn -> R.drawable.ime_action_key_bg
                key == "shift" && isShifted -> R.drawable.ime_toggle_active
                else -> R.drawable.ime_key_bg
            })
            layoutParams = LinearLayout.LayoutParams(
                0,
                if (isSpace || isReturn) dp(56) else dp(58),
                when {
                    isSpace -> 4.5f
                    key == "123" -> 2.2f
                    isReturn -> 2.2f
                    key == "😊" -> 1.4f
                    isSpecial -> 1.4f
                    else -> 1f
                }
            ).apply {
                setMargins(3, 0, 3, 0)
            }
            setOnClickListener { handleKey(key) }
        }
    }

    private fun handleKey(key: String) {
        when (key) {
            "shift" -> {
                isShifted = !isShifted
                buildKeyboard()
            }
            "backspace" -> backspace()
            "space" -> commitToHost(" ")
            "return" -> commitReturn()
            "123" -> {
                isSymbols = !isSymbols
                isEmoji = false
                buildKeyboard()
            }
            "ABC" -> {
                isSymbols = false
                isEmoji = false
                buildKeyboard()
            }
            "😊" -> {
                isEmoji = true
                isSymbols = false
                buildKeyboard()
            }
            else -> {
                if (isLetter(key)) {
                    val textToCommit = if (isShifted) key.uppercase() else key.lowercase()
                    commitToHost(textToCommit)
                    if (isShifted) {
                        isShifted = false
                        buildKeyboard()
                    }
                } else {
                    commitToHost(key)
                }
            }
        }
    }

    private fun toggleVoiceMode() {
        if (isVoiceMode) {
            showKeyboardMode()
        } else {
            showVoiceMode()
        }
    }

    private fun showKeyboardMode() {
        isVoiceMode = false
        keyboardPanel.visibility = View.VISIBLE
        voicePanel.visibility = View.GONE
        previewText.visibility = View.GONE
        statusText.text = ""
        voiceToggleButton.setBackgroundResource(android.R.color.transparent)
        languageToggleButton.setBackgroundResource(R.drawable.ime_toggle_active)
        stopPulseAnimation()
    }

    private fun showVoiceMode() {
        isVoiceMode = true
        keyboardPanel.visibility = View.GONE
        voicePanel.visibility = View.VISIBLE
        previewText.visibility = if (finalText.isBlank()) View.GONE else View.VISIBLE
        statusText.text = "Tap to speak"
        voiceToggleButton.setBackgroundResource(R.drawable.ime_toggle_active)
        languageToggleButton.setBackgroundResource(android.R.color.transparent)
        cachedInputConnection = currentInputConnection
    }

    private fun cycleLanguage() {
        languageIndex = (languageIndex + 1) % languageValues.size
        languageToggleButton.text = languageLabels[languageIndex]
        buildKeyboard()
    }

    private fun startListening() {
        cachedInputConnection = currentInputConnection
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            statusText.text = "Speech recognition is unavailable"
            return
        }

        speechRecognizer?.destroy()
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        speechStartTime = System.currentTimeMillis()
        speechRecognizer?.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                statusText.text = "Listening..."
                isListening = true
                startPulseAnimation()
                speechStartTime = System.currentTimeMillis()
            }

            override fun onBeginningOfSpeech() {
                statusText.text = "Speech detected"
                speechStartTime = System.currentTimeMillis()
            }

            override fun onRmsChanged(rmsdB: Float) {
                if (!isListening) return
                lastRmsLevel = rmsdB
                mainHandler.post { updateWaveFromRms(rmsdB) }
            }

            override fun onBufferReceived(buffer: ByteArray?) = Unit

            override fun onEndOfSpeech() {
                statusText.text = "Transcribing..."
                isListening = false
            }

            override fun onError(error: Int) {
                statusText.text = "Could not transcribe. Try again."
                isListening = false
                stopPulseAnimation()
            }

            override fun onResults(results: Bundle?) {
                stopPulseAnimation()
                isListening = false
                val durationMs = System.currentTimeMillis() - speechStartTime
                val durationSec = Math.round(durationMs / 1000.0).toInt().coerceAtLeast(1)

                val transcript = results
                    ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    ?.firstOrNull()
                    .orEmpty()
                if (transcript.isBlank()) {
                    statusText.text = "No speech detected"
                    return
                }
                previewText.visibility = View.VISIBLE
                previewText.text = transcript
                statusText.text = "Cleaning with AI..."
                sendTranscriptForCleanup(transcript, selectedMode, selectedLanguage(), durationSec)
            }

            override fun onPartialResults(partialResults: Bundle?) {
                val partial = partialResults
                    ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    ?.firstOrNull()
                if (!partial.isNullOrBlank()) {
                    previewText.visibility = View.VISIBLE
                    previewText.text = partial
                }
            }

            override fun onEvent(eventType: Int, params: Bundle?) = Unit
        })

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, selectedLanguage())
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }
        speechRecognizer?.startListening(intent)
    }

    private fun sendTranscriptForCleanup(transcript: String, mode: String, language: String, durationSec: Int) {
        Thread {
            val prefs = getSharedPreferences("hypervoice_keyboard", MODE_PRIVATE)
            val apiBaseUrl = prefs.getString("apiBaseUrl", DEFAULT_API_BASE_URL) ?: DEFAULT_API_BASE_URL
            val userId = prefs.getString("userId", "").orEmpty()
            val saveHistory = prefs.getBoolean("saveHistory", true)

            if (userId.isBlank()) {
                insertResult(basicCleanup(transcript), "Offline Mode (Login Required)")
                return@Thread
            }

            try {
                val body = JSONObject()
                    .put("userId", userId)
                    .put("transcript", transcript)
                    .put("mode", mode)
                    .put("language", language)
                    .put("saveHistory", saveHistory)
                    .put("durationSec", durationSec)

                val connection = (URL("$apiBaseUrl/api/ai/cleanup").openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    connectTimeout = 15000
                    readTimeout = 45000
                    setRequestProperty("Content-Type", "application/json")
                    doOutput = true
                }

                OutputStreamWriter(connection.outputStream).use { writer ->
                    writer.write(body.toString())
                }

                val code = connection.responseCode
                val stream = if (code in 200..299) connection.inputStream else connection.errorStream
                val response = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
                if (code in 200..299) {
                    val final = JSONObject(response).optString("finalText", basicCleanup(transcript))
                    insertResult(final, "Inserted")
                } else {
                    val fallback = basicCleanup(transcript)
                    insertResult(fallback, "Inserted (offline cleanup)")
                }
            } catch (_: Exception) {
                val fallback = basicCleanup(transcript)
                insertResult(fallback, "Inserted (offline cleanup)")
            }
        }.start()
    }

    private fun insertResult(text: String, status: String) {
        mainHandler.post {
            finalText = text
            previewText.visibility = View.VISIBLE
            previewText.text = text
            statusText.text = status
            val committed = commitToHost(text)
            if (!committed) {
                statusText.text = "Tap the text field, then try again"
            }
        }
    }

    private fun commitToHost(text: String): Boolean {
        if (text.isBlank()) return false
        val ic = currentInputConnection ?: cachedInputConnection ?: return false
        ic.finishComposingText()
        ic.beginBatchEdit()
        try {
            ic.commitText(text, 1)
        } finally {
            ic.endBatchEdit()
        }
        cachedInputConnection = ic
        return true
    }

    private fun backspace() {
        val ic = currentInputConnection ?: cachedInputConnection ?: return
        ic.deleteSurroundingText(1, 0)
    }

    private fun commitReturn() {
        commitToHost("\n")
    }

    private fun selectedLanguage(): String = languageValues[languageIndex]

    private fun basicCleanup(input: String): String {
        val noFillers = input
            .trim()
            .replace(Regex("\\s+"), " ")
            .replace(Regex("\\b(um+|uh+|like|you know)\\b[\\s,]*", RegexOption.IGNORE_CASE), "")
            .trim()
        if (noFillers.isBlank()) return ""
        val capitalized = noFillers.replaceFirstChar {
            if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString()
        }
        return if (capitalized.endsWith(".") || capitalized.endsWith("!") || capitalized.endsWith("?")) {
            capitalized
        } else {
            "$capitalized."
        }
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

    private fun updateWaveFromRms(rmsdB: Float) {
        if (waveBars.isEmpty()) return
        val normalized = ((rmsdB + 2f) / 12f).coerceIn(0.2f, 1.4f)
        waveBars.forEachIndexed { index, bar ->
            val stagger = 0.85f + (index % 3) * 0.08f
            bar.scaleY = max(0.25f, normalized * stagger)
        }
    }

    private fun startPulseAnimation() {
        mainHandler.post {
            stopPulseAnimation()

            val container = waveContainer ?: return@post
            val micButton = voicePanel.findViewById<View>(R.id.micButton)

            micButton.visibility = View.GONE
            container.visibility = View.VISIBLE

            val animators = waveBars.mapIndexed { index, bar ->
                val delay = (index * 90).toLong()
                android.animation.ObjectAnimator.ofFloat(bar, "scaleY", 0.25f, 1.3f, 0.25f).apply {
                    repeatCount = android.animation.ValueAnimator.INFINITE
                    repeatMode = android.animation.ValueAnimator.RESTART
                    startDelay = delay
                    duration = 700
                }
            }

            animatorSet = android.animation.AnimatorSet().apply {
                playTogether(animators)
                start()
            }
        }
    }

    private fun stopPulseAnimation() {
        mainHandler.post {
            isListening = false
            animatorSet?.cancel()
            animatorSet = null

            val micButton = voicePanel.findViewById<View>(R.id.micButton)
            micButton?.visibility = View.VISIBLE
            waveContainer?.visibility = View.GONE

            waveBars.forEach {
                it.scaleY = 1.0f
            }
        }
    }

    override fun onDestroy() {
        stopPulseAnimation()
        speechRecognizer?.destroy()
        speechRecognizer = null
        super.onDestroy()
    }

    companion object {
        private const val DEFAULT_API_BASE_URL = "http://192.168.0.125:3001"
    }
}
