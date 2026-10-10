package expo.modules.qosmetrics

import android.content.Context
import android.telephony.TelephonyManager
import android.telephony.CellInfo
import android.telephony.CellSignalStrengthLte
import android.telephony.CellSignalStrengthNr
import android.telephony.CellSignalStrengthGsm
import android.telephony.CellSignalStrengthWcdma
import android.os.Build
import androidx.core.content.ContextCompat
import android.Manifest
import android.content.pm.PackageManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class QosMetricsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("QosMetrics")

    AsyncFunction("getTelephonyInfo") { ->
      val context = appContext.reactContext ?: return@AsyncFunction mapOf(
        "carrier" to "Desconocido",
        "rssi" to -100
      )

      val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
      var carrierName = telephonyManager.networkOperatorName
      if (carrierName.isNullOrEmpty()) {
        carrierName = "Sin red / Simulado"
      }

      var rssi = -100
      
      // Check for permissions
      if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
          ContextCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED) {
          
          try {
              val cellInfoList: List<CellInfo>? = telephonyManager.allCellInfo
              if (!cellInfoList.isNullOrEmpty()) {
                  val cellInfo = cellInfoList[0]
                  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && cellInfo.cellSignalStrength is CellSignalStrengthNr) {
                      rssi = (cellInfo.cellSignalStrength as CellSignalStrengthNr).dbm
                  } else if (cellInfo.cellSignalStrength is CellSignalStrengthLte) {
                      rssi = (cellInfo.cellSignalStrength as CellSignalStrengthLte).dbm
                  } else if (cellInfo.cellSignalStrength is CellSignalStrengthWcdma) {
                      rssi = (cellInfo.cellSignalStrength as CellSignalStrengthWcdma).dbm
                  } else if (cellInfo.cellSignalStrength is CellSignalStrengthGsm) {
                      rssi = (cellInfo.cellSignalStrength as CellSignalStrengthGsm).dbm
                  }
              }
          } catch (e: Exception) {
              // Si falla al leer (ej. simulador sin soporte), caemos al default
              rssi = -90
          }
      }

      mapOf(
        "carrier" to carrierName,
        "rssi" to rssi
      )
    }
  }
}
