package com.anonymous.mobile

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap

/**
 * Módulo React Native que expõe as funções de verificação de bateria
 * para o JavaScript.
 * 
 * Métodos disponíveis:
 * - isLowPowerModeEnabled(): Promise<boolean>
 * - getBatteryStatus(): Promise<object>
 * - getBatteryLevel(): Promise<number>
 */
class RNCBatteryManagerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  
  private val batteryManager = BatteryManager(reactContext)

  override fun getName(): String {
    return "RNCBatteryManager"
  }

  override fun initialize() {
    // Inicialização não é necessária para este módulo
  }

  override fun invalidate() {
    // Limpeza não é necessária para este módulo
  }

  /**
   * Verifica se Low Power Mode ou Doze Mode estão ativados
   * Retorna um Promise que resolve com um boolean
   */
  @ReactMethod
  fun isLowPowerModeEnabled(promise: Promise) {
    try {
      val isEnabled = batteryManager.isOptimizationEnabled()
      promise.resolve(isEnabled)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message, e)
    }
  }

  /**
   * Obtém status completo de bateria
   * Retorna um Promise que resolve com um mapa contendo:
   * {
   *   isLowPowerMode: boolean,
   *   isDozeMode: boolean,
   *   batteryLevel: number (0-100),
   *   isBatteryLow: boolean
   * }
   */
  @ReactMethod
  fun getBatteryStatus(promise: Promise) {
    try {
      val status = batteryManager.getBatteryStatus()
      val result: WritableMap = WritableNativeMap()
      
      result.putBoolean("isLowPowerMode", status["isLowPowerMode"] as Boolean)
      result.putBoolean("isDozeMode", status["isDozeMode"] as Boolean)
      result.putInt("batteryLevel", status["batteryLevel"] as Int)
      result.putBoolean("isBatteryLow", status["isBatteryLow"] as Boolean)
      
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message, e)
    }
  }

  /**
   * Obtém apenas o nível de bateria (0-100)
   */
  @ReactMethod
  fun getBatteryLevel(promise: Promise) {
    try {
      val level = batteryManager.getBatteryLevel()
      promise.resolve(level)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message, e)
    }
  }
}
