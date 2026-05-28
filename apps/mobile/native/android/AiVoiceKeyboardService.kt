package com.hypervoice.ime

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.GradientDrawable
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
import android.widget.PopupWindow
import android.widget.ScrollView
import android.widget.TextView
import com.hypervoice.R
import com.hypervoice.BuildConfig
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale
import kotlin.math.max
import kotlin.math.min

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
    private var quickRetryCount = 0
    private var activePreviewLength = 0
    private var latestPartialTranscript = ""

    private val languageValues = listOf(
        "en-US",
        "bn-BD",
        "hi-IN",
        "es-ES",
        "fr-FR",
        "de-DE",
        "it-IT",
        "pt-BR",
        "ar-SA",
        "zh-CN",
        "ja-JP",
        "ko-KR",
        "ru-RU",
        "tr-TR",
        "id-ID",
        "ms-MY",
        "th-TH",
        "vi-VN",
        "ur-PK",
        "ta-IN",
        "te-IN",
        "mr-IN",
        "nl-NL",
        "pl-PL",
        "uk-UA",
        "el-GR",
        "he-IL",
        "fa-IR",
        "sv-SE",
        "nb-NO",
        "da-DK",
        "fi-FI",
        "cs-CZ",
        "ro-RO",
        "hu-HU",
        "bg-BG",
        "hr-HR",
        "sr-RS",
        "sk-SK",
        "sl-SI",
        "lt-LT",
        "lv-LV",
        "et-EE",
        "fil-PH",
        "sw-TZ",
        "af-ZA",
        "sq-AL",
        "am-ET",
        "hy-AM",
        "az-AZ",
        "eu-ES",
        "be-BY",
        "bs-BA",
        "my-MM",
        "ca-ES",
        "ceb-PH",
        "ny-MW",
        "co-FR",
        "eo-001",
        "fy-NL",
        "gl-ES",
        "ka-GE",
        "gu-IN",
        "ht-HT",
        "ha-NG",
        "haw-US",
        "hmn-CN",
        "is-IS",
        "ig-NG",
        "ga-IE",
        "jv-ID",
        "kn-IN",
        "kk-KZ",
        "km-KH",
        "rw-RW",
        "ku-IQ",
        "ky-KG",
        "lo-LA",
        "la-VA",
        "lb-LU",
        "mk-MK",
        "mg-MG",
        "ml-IN",
        "mt-MT",
        "mi-NZ",
        "mn-MN",
        "ne-NP",
        "or-IN",
        "ps-AF",
        "pa-IN",
        "sm-WS",
        "gd-GB",
        "st-LS",
        "sn-ZW",
        "sd-PK",
        "si-LK",
        "so-SO",
        "su-ID",
        "tg-TJ",
        "uz-UZ",
        "cy-GB",
        "xh-ZA",
        "yi-IL",
        "yo-NG",
        "zu-ZA"
    )
    private val languageLabels = listOf(
        "EN",
        "BN",
        "HI",
        "ES",
        "FR",
        "DE",
        "IT",
        "PT",
        "AR",
        "ZH",
        "JA",
        "KO",
        "RU",
        "TR",
        "ID",
        "MS",
        "TH",
        "VI",
        "UR",
        "TA",
        "TE",
        "MR",
        "NL",
        "PL",
        "UK",
        "EL",
        "HE",
        "FA",
        "SV",
        "NO",
        "DA",
        "FI",
        "CS",
        "RO",
        "HU",
        "BG",
        "HR",
        "SR",
        "SK",
        "SL",
        "LT",
        "LV",
        "ET",
        "FI",
        "SW",
        "AF",
        "SQ",
        "AM",
        "HY",
        "AZ",
        "EU",
        "BE",
        "BS",
        "MY",
        "CA",
        "CE",
        "NY",
        "CO",
        "EO",
        "FY",
        "GL",
        "KA",
        "GU",
        "HT",
        "HA",
        "HA",
        "HM",
        "IS",
        "IG",
        "GA",
        "JV",
        "KN",
        "KK",
        "KM",
        "RW",
        "KU",
        "KY",
        "LO",
        "LA",
        "LB",
        "MK",
        "MG",
        "ML",
        "MT",
        "MI",
        "MN",
        "NE",
        "OR",
        "PS",
        "PA",
        "SM",
        "GD",
        "ST",
        "SN",
        "SD",
        "SI",
        "SO",
        "SU",
        "TG",
        "UZ",
        "CY",
        "XH",
        "YI",
        "YO",
        "ZU"
    )
    private val languageNames = listOf(
        "English",
        "Bangla",
        "Hindi",
        "Spanish",
        "French",
        "German",
        "Italian",
        "Portuguese",
        "Arabic",
        "Chinese",
        "Japanese",
        "Korean",
        "Russian",
        "Turkish",
        "Indonesian",
        "Malay",
        "Thai",
        "Vietnamese",
        "Urdu",
        "Tamil",
        "Telugu",
        "Marathi",
        "Dutch",
        "Polish",
        "Ukrainian",
        "Greek",
        "Hebrew",
        "Persian",
        "Swedish",
        "Norwegian",
        "Danish",
        "Finnish",
        "Czech",
        "Romanian",
        "Hungarian",
        "Bulgarian",
        "Croatian",
        "Serbian",
        "Slovak",
        "Slovenian",
        "Lithuanian",
        "Latvian",
        "Estonian",
        "Filipino",
        "Swahili",
        "Afrikaans",
        "Albanian",
        "Amharic",
        "Armenian",
        "Azerbaijani",
        "Basque",
        "Belarusian",
        "Bosnian",
        "Burmese",
        "Catalan",
        "Cebuano",
        "Chichewa",
        "Corsican",
        "Esperanto",
        "Frisian",
        "Galician",
        "Georgian",
        "Gujarati",
        "Haitian Creole",
        "Hausa",
        "Hawaiian",
        "Hmong",
        "Icelandic",
        "Igbo",
        "Irish",
        "Javanese",
        "Kannada",
        "Kazakh",
        "Khmer",
        "Kinyarwanda",
        "Kurdish",
        "Kyrgyz",
        "Lao",
        "Latin",
        "Luxembourgish",
        "Macedonian",
        "Malagasy",
        "Malayalam",
        "Maltese",
        "Maori",
        "Mongolian",
        "Nepali",
        "Odia",
        "Pashto",
        "Punjabi",
        "Samoan",
        "Scots Gaelic",
        "Sesotho",
        "Shona",
        "Sindhi",
        "Sinhala",
        "Somali",
        "Sundanese",
        "Tajik",
        "Uzbek",
        "Welsh",
        "Xhosa",
        "Yiddish",
        "Yoruba",
        "Zulu"
    )
    private val languageCountries = listOf(
        "US",
        "BD",
        "IN",
        "ES",
        "FR",
        "DE",
        "IT",
        "BR",
        "SA",
        "CN",
        "JP",
        "KR",
        "RU",
        "TR",
        "ID",
        "MY",
        "TH",
        "VN",
        "PK",
        "IN",
        "IN",
        "IN",
        "NL",
        "PL",
        "UA",
        "GR",
        "IL",
        "IR",
        "SE",
        "NO",
        "DK",
        "FI",
        "CZ",
        "RO",
        "HU",
        "BG",
        "HR",
        "RS",
        "SK",
        "SI",
        "LT",
        "LV",
        "EE",
        "PH",
        "TZ",
        "ZA",
        "AL",
        "ET",
        "AM",
        "AZ",
        "ES",
        "BY",
        "BA",
        "MM",
        "ES",
        "PH",
        "MW",
        "FR",
        "001",
        "NL",
        "ES",
        "GE",
        "IN",
        "HT",
        "NG",
        "US",
        "CN",
        "IS",
        "NG",
        "IE",
        "ID",
        "IN",
        "KZ",
        "KH",
        "RW",
        "IQ",
        "KG",
        "LA",
        "VA",
        "LU",
        "MK",
        "MG",
        "IN",
        "MT",
        "NZ",
        "MN",
        "NP",
        "IN",
        "AF",
        "IN",
        "WS",
        "GB",
        "LS",
        "ZW",
        "PK",
        "LK",
        "SO",
        "ID",
        "TJ",
        "UZ",
        "GB",
        "ZA",
        "IL",
        "NG",
        "ZA"
    )
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
        languageToggleButton.setOnLongClickListener { showLanguagePicker() }
        view.findViewById<View>(R.id.micButton).setOnClickListener { startListening(true) }
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
                setPadding(if (rowIndex == 1 && !isEmoji) dp(18) else 0, dp(2), if (rowIndex == 1 && !isEmoji) dp(18) else 0, dp(2))
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
            textSize = when {
                isReturn -> 21f
                isSpace -> 20f
                isSpecial -> 17f
                else -> 23f
            }
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
                if (isSpace || isReturn) dp(46) else dp(48),
                when {
                    isSpace -> 4.8f
                    key == "123" -> 2.4f
                    isReturn -> 2.4f
                    key == "😊" -> 1.4f
                    isSpecial -> 1.35f
                    else -> 1f
                }
            ).apply {
                setMargins(dp(2), 0, dp(2), 0)
            }
            setOnClickListener { handleKey(key) }
            if (key == "backspace") {
                setOnLongClickListener {
                    deleteAllTextAroundCursor()
                    true
                }
            }
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
        selectLanguage(languageIndex)
    }

    private fun selectLanguage(index: Int) {
        languageIndex = index.coerceIn(0, languageValues.lastIndex)
        languageToggleButton.text = languageLabels[languageIndex]
        getSharedPreferences("hypervoice_keyboard", MODE_PRIVATE)
            .edit()
            .putString("defaultLanguage", languageValues[languageIndex])
            .apply()
        buildKeyboard()
    }

    private fun showLanguagePicker(): Boolean {
        val popup = PopupWindow(this)
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), dp(12), dp(12), dp(12))
            background = roundedBg(Color.WHITE, dp(22), 0xFFE7EAF0.toInt())
        }

        container.addView(TextView(this).apply {
            text = "Choose language"
            textSize = 17f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(0xFF111111.toInt())
            setPadding(dp(8), dp(4), dp(8), dp(12))
        })

        languageValues.forEachIndexed { index, _ ->
            val selected = index == languageIndex
            val row = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(dp(12), dp(9), dp(12), dp(9))
                background = roundedBg(
                    if (selected) 0xFF111111.toInt() else 0xFFF6F7FA.toInt(),
                    dp(16),
                    if (selected) 0xFF111111.toInt() else 0xFFE9ECF2.toInt()
                )
                isClickable = true
                setOnClickListener {
                    selectLanguage(index)
                    popup.dismiss()
                }
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    setMargins(0, 0, 0, dp(8))
                }
            }

            row.addView(TextView(this).apply {
                text = flagEmoji(languageCountries[index])
                textSize = 22f
                gravity = Gravity.CENTER
                layoutParams = LinearLayout.LayoutParams(dp(42), dp(42))
            })

            row.addView(TextView(this).apply {
                text = "${languageNames[index]}\n${languageValues[index]}"
                textSize = 15f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(if (selected) Color.WHITE else 0xFF111111.toInt())
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            })

            row.addView(TextView(this).apply {
                text = languageLabels[index]
                textSize = 13f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(if (selected) Color.WHITE else 0xFF667085.toInt())
            })

            container.addView(row)
        }

        val scroll = ScrollView(this).apply {
            addView(container)
            isVerticalScrollBarEnabled = true
            background = ColorDrawable(Color.TRANSPARENT)
        }

        popup.contentView = scroll
        popup.width = min(resources.displayMetrics.widthPixels - dp(28), dp(430))
        popup.height = min(resources.displayMetrics.heightPixels / 2, dp(390))
        popup.isFocusable = true
        popup.isOutsideTouchable = true
        popup.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            popup.elevation = dp(14).toFloat()
        }
        popup.showAtLocation(languageToggleButton, Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL, 0, dp(10))
        return true
    }

    private fun roundedBg(color: Int, radius: Int, strokeColor: Int): GradientDrawable {
        return GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = radius.toFloat()
            setColor(color)
            setStroke(dp(1), strokeColor)
        }
    }

    private fun flagEmoji(countryCode: String): String {
        val base = 0x1F1E6 - 'A'.code
        return countryCode.uppercase(Locale.US).map { char ->
            String(Character.toChars(base + char.code))
        }.joinToString("")
    }

    private fun startListening(allowQuickRetry: Boolean = true) {
        cachedInputConnection = currentInputConnection
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            statusText.text = "Speech recognition is unavailable"
            return
        }

        speechRecognizer?.destroy()
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        speechStartTime = System.currentTimeMillis()
        isListening = true
        latestPartialTranscript = ""
        statusText.text = "Listening"
        startPulseAnimation()
        speechRecognizer?.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                statusText.text = "Listening"
                isListening = true
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
                val elapsedMs = System.currentTimeMillis() - speechStartTime
                if (latestPartialTranscript.isNotBlank()) {
                    val durationSec = Math.round(elapsedMs / 1000.0).toInt().coerceAtLeast(1)
                    statusText.text = "Cleaning with AI..."
                    isListening = false
                    quickRetryCount = 0
                    stopPulseAnimation()
                    sendTranscriptForCleanup(latestPartialTranscript, selectedMode, selectedLanguage(), durationSec)
                    return
                }
                if (allowQuickRetry && quickRetryCount < 3 && elapsedMs < 4500) {
                    quickRetryCount += 1
                    statusText.text = "Listening..."
                    isListening = true
                    startPulseAnimation()
                    mainHandler.postDelayed({ startListening(true) }, 320)
                    return
                }
                statusText.text = "Could not transcribe. Try again."
                quickRetryCount = 0
                isListening = false
                stopPulseAnimation()
            }

            override fun onResults(results: Bundle?) {
                stopPulseAnimation()
                isListening = false
                quickRetryCount = 0
                val durationMs = System.currentTimeMillis() - speechStartTime
                val durationSec = Math.round(durationMs / 1000.0).toInt().coerceAtLeast(1)

                val transcript = results
                    ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    ?.firstOrNull()
                    .orEmpty()
                    .ifBlank { latestPartialTranscript }
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
                    latestPartialTranscript = partial
                    previewText.visibility = View.VISIBLE
                    previewText.text = partial
                    previewToHost(partial)
                }
            }

            override fun onEvent(eventType: Int, params: Bundle?) = Unit
        })

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, selectedLanguage())
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 5000)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 3800)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 4500)
        }
        speechRecognizer?.startListening(intent)
    }

    private fun sendTranscriptForCleanup(transcript: String, mode: String, language: String, durationSec: Int) {
        Thread {
            val prefs = getSharedPreferences("hypervoice_keyboard", MODE_PRIVATE)
            val apiBaseUrl = (prefs.getString("apiBaseUrl", DEFAULT_API_BASE_URL) ?: DEFAULT_API_BASE_URL).trimEnd('/')
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
            finalText = appendPreviewText(finalText, text)
            previewText.visibility = View.VISIBLE
            previewText.text = finalText
            statusText.text = status
            val committed = commitFinalText(text)
            if (!committed) {
                statusText.text = "Tap the text field, then try again"
            }
        }
    }

    private fun appendPreviewText(existing: String, next: String): String {
        if (existing.isBlank()) return next
        if (next.isBlank()) return existing
        return "${existing.trimEnd()} ${next.trimStart()}"
    }

    private fun commitToHost(text: String): Boolean {
        if (text.isEmpty()) return false
        val ic = currentInputConnection ?: cachedInputConnection ?: return false
        ic.beginBatchEdit()
        val committed = try {
            ic.commitText(text, 1)
            ic.finishComposingText()
        } finally {
            ic.endBatchEdit()
        }
        cachedInputConnection = ic
        return committed
    }

    private fun previewToHost(text: String): Boolean {
        if (text.isBlank()) return false
        val ic = currentInputConnection ?: cachedInputConnection ?: return false
        ic.beginBatchEdit()
        val previewed = try {
            if (activePreviewLength > 0) {
                ic.deleteSurroundingText(activePreviewLength, 0)
            }
            ic.commitText(text, 1)
            activePreviewLength = text.length
            true
        } finally {
            ic.endBatchEdit()
        }
        cachedInputConnection = ic
        return previewed
    }

    private fun commitFinalText(text: String): Boolean {
        if (text.isBlank()) return false
        val ic = currentInputConnection ?: cachedInputConnection ?: return false
        ic.beginBatchEdit()
        val committed = try {
            if (activePreviewLength > 0) {
                ic.deleteSurroundingText(activePreviewLength, 0)
                activePreviewLength = 0
            }
            val before = ic.getTextBeforeCursor(1, 0)?.toString().orEmpty()
            val separator = if (before.isNotEmpty() && !before.last().isWhitespace()) " " else ""
            ic.commitText(separator + text.trim(), 1)
            ic.finishComposingText()
            true
        } finally {
            ic.endBatchEdit()
        }
        cachedInputConnection = ic
        return committed
    }

    private fun backspace() {
        val ic = currentInputConnection ?: cachedInputConnection ?: return
        ic.deleteSurroundingText(1, 0)
    }

    private fun deleteAllTextAroundCursor() {
        val ic = currentInputConnection ?: cachedInputConnection ?: return
        ic.beginBatchEdit()
        try {
            ic.deleteSurroundingText(10000, 10000)
            ic.commitText("", 1)
        } finally {
            ic.endBatchEdit()
        }
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
            if (looksLikeQuestion(capitalized)) "$capitalized?" else "$capitalized."
        }
    }

    private fun looksLikeQuestion(input: String): Boolean {
        return Regex("^(who|what|when|where|why|how|can|could|would|will|do|does|did|is|are|am|should|may|might|has|have|had)\\b", RegexOption.IGNORE_CASE)
            .containsMatchIn(input.trim())
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
            animatorSet?.cancel()
            animatorSet = null

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
        private val DEFAULT_API_BASE_URL = BuildConfig.HYPERVOICE_API_BASE_URL
    }
}
