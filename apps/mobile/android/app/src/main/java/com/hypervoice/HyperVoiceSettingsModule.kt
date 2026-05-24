package com.hypervoice

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class HyperVoiceSettingsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "HyperVoiceSettings"

    @ReactMethod
    fun saveSettings(settings: ReadableMap) {
        val prefs = reactContext.getSharedPreferences("hypervoice_keyboard", Context.MODE_PRIVATE)
        prefs.edit()
            .putString("userId", settings.getString("userId") ?: "")
            .putString("apiBaseUrl", settings.getString("apiBaseUrl") ?: "http://192.168.0.125:3001")
            .putString("defaultLanguage", settings.getString("defaultLanguage") ?: "en-US")
            .putString("defaultMode", settings.getString("defaultMode") ?: "cleanup")
            .putBoolean("saveHistory", if (settings.hasKey("saveHistory")) settings.getBoolean("saveHistory") else true)
            .apply()
    }
}
