package com.anonymous.mobile

import android.content.Context
import android.os.BatteryManager as AndroidBatteryManager
import android.os.Build
import android.os.PowerManager
import android.content.Intent
import android.content.IntentFilter

/**
 * Utilitário para verificar estado de bateria e otimizações
 * Fornece métodos para:
 * - Verificar Low Power Mode
 * - Verificar Doze Mode
 * - Obter nível de bateria
 */
class BatteryManager(private val context: Context) {
  private val powerManager = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
  private val androidBatteryManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
    context.getSystemService(Context.BATTERY_SERVICE) as? AndroidBatteryManager
  } else {
    null
  }

  /**
   * Verifica se Low Power Mode está ativado
   */
  fun isLowPowerModeEnabled(): Boolean {
    return try {
      powerManager?.isPowerSaveMode ?: false
    } catch (e: Exception) {
      false
    }
  }

  /**
   * Verifica se Doze Mode está ativado
   * Nota: Requer API 21+
   */
  fun isDozeMode(): Boolean {
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        powerManager?.isDeviceIdleMode ?: false
      } else {
        false
      }
    } catch (e: Exception) {
      false
    }
  }

  /**
   * Obtém o nível atual de bateria (0-100)
   */
  fun getBatteryLevel(): Int {
    return try {
      val intentFilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
      val batteryStatus: Intent? = context.registerReceiver(null, intentFilter)
      
      val level = batteryStatus?.getIntExtra(AndroidBatteryManager.EXTRA_LEVEL, -1) ?: -1
      val scale = batteryStatus?.getIntExtra(AndroidBatteryManager.EXTRA_SCALE, 100) ?: 100
      
      if (level >= 0) {
        (level * 100) / scale
      } else {
        -1
      }
    } catch (e: Exception) {
      -1
    }
  }

  /**
   * Verifica se bateria está baixa (<20%)
   */
  fun isBatteryLow(): Boolean {
    return getBatteryLevel() in 0..19
  }

  /**
   * Obtém status completo de bateria
   */
  fun getBatteryStatus(): Map<String, Any> {
    return mapOf(
      "isLowPowerMode" to isLowPowerModeEnabled(),
      "isDozeMode" to isDozeMode(),
      "batteryLevel" to getBatteryLevel(),
      "isBatteryLow" to isBatteryLow()
    )
  }

  /**
   * Verifica se otimização de bateria está ativa
   * Retorna true se Low Power Mode OU Doze Mode estiverem ativos
   */
  fun isOptimizationEnabled(): Boolean {
    return isLowPowerModeEnabled() || isDozeMode() || isBatteryLow()
  }
}
