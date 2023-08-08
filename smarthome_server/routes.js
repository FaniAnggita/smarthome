const express = require("express");

const {
  lampSwitchHandler,
  lampColorHandler,
  lampBrightHandler,
  lampStatusHandler,
  lampScheduleHandler,
  getTotalDeviceStatus,
  getEneryConsumption,
  getEnergyConsumptionPerHour,
  getEnergyConsumptionPerWeek,
  workModeHandler,
  getEnergyConsumptionPerMonth,
  getDeviceDataHandler,
} = require("./handlers");

const {
  saveUserDataHandler,
  getAllUserDataHandler,
  loginHandler,
  updateUserDataHandler,
  deleteUserDataHandler,
} = require("./user_handler");

const {
  lampStatusScheduleHandler,
  curtainStatusScheduleHandler,
  fanStatusScheduleHandler,
  vacuumStatusScheduleHandler,
} = require("./schedule_handler");
const {
  smartCurtainSwitch,
  smartCurtainWorkModeHandler,
  smartCurtainStatusHandler,
  smartFanSwitch,
  smartFanSpeed,
  smartFanShake,
  smartFanStatusHandler,
  smartVacuumSwitch,
  smartVacuumWorkMode,
  smartVacuumStatusHandler,
} = require("./appliance_handler");

const router = express.Router();

router.post("/lamp/switch", lampSwitchHandler);
router.post("/lamp/color", lampColorHandler);
router.post("/lamp/bright", lampBrightHandler);
router.post("/lamp/status", lampStatusHandler);
router.post("/lamp/schedule", lampScheduleHandler);
router.post("/lamp/statusSchedule", lampStatusScheduleHandler);
router.get("/lamp/totalDeviceStatus", getTotalDeviceStatus);
router.get("/lamp/getEneryConsumption", getEneryConsumption);
router.get("/lamp/getEnergyConsumptionPerHour", getEnergyConsumptionPerHour);
router.get("/lamp/getEnergyConsumptionPerWeek", getEnergyConsumptionPerWeek);
router.get("/lamp/getEnergyConsumptionPerMonth", getEnergyConsumptionPerMonth);
router.post("/lamp/workModeHandler", workModeHandler);
router.post("/user/saveUserDataHandler", saveUserDataHandler);
router.post("/user/updateUserDataHandler", updateUserDataHandler);
router.post("/user/deleteUserDataHandler", deleteUserDataHandler);
router.post("/user/loginHandler", loginHandler);
router.get("/user/getAllUserDataHandler", getAllUserDataHandler);
router.get("/device/getDeviceDataHandler", getDeviceDataHandler);

router.post("/curtain/smartCurtainSwitch", smartCurtainSwitch);
router.post(
  "/curtain/smartCurtainWorkModeHandler",
  smartCurtainWorkModeHandler
);
router.post("/curtain/smartCurtainStatusHandler", smartCurtainStatusHandler);
router.post(
  "/curtain/curtainStatusScheduleHandler",
  curtainStatusScheduleHandler
);

router.post("/fan/smartFanSwitch", smartFanSwitch);
router.post("/fan/smartFanSpeed", smartFanSpeed);
router.post("/fan/smartFanShake", smartFanShake);
router.post("/fan/smartFanStatusHandler", smartFanStatusHandler);
router.post("/fan/fanStatusScheduleHandler", fanStatusScheduleHandler);

router.post("/vacuum/smartVacuumSwitch", smartVacuumSwitch);
router.post("/vacuum/smartVacuumWorkMode", smartVacuumWorkMode);
router.post("/vacuum/smartVacuumStatusHandler", smartVacuumStatusHandler);
router.post("/vacuum/vacuumStatusScheduleHandler", vacuumStatusScheduleHandler);

module.exports = router;
