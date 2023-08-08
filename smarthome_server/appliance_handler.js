// handlers.js
const { TuyaContext } = require("../src");
const connection = require("./database");

const tuya = new TuyaContext({
  baseUrl: "https://openapi.tuyaus.com",
  accessKey: "57kwg3m99pfuvhwwdqcq",
  secretKey: "964a6cb572ed421f8fe998b8b31b55c9",
});

const smartCurtainSwitch = async (req, res) => {
  try {
    const { action, device_id } = req.body;
    const command = {
      code: "control",
      value: action === "open" ? "open" : "close",
    };

    const response = await tuya.request({
      path: `/v1.0/iot-03/devices/${device_id}/commands`,
      method: "POST",
      body: {
        commands: [command],
      },
    });

    if (response.success) {
      const message =
        action === "open"
          ? "Smart curtain turned open successfully"
          : "Smart curtain turned close successfully";
      res.json({ message });
    } else {
      throw new Error("Failed to control the Smart curtain");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const smartCurtainWorkModeHandler = async (req, res) => {
  try {
    const { workMode, device_id } = req.body;
    let value = "";

    if (workMode === "1") {
      value = "open";
    } else if (workMode === "2") {
      value = "close";
    } else if (workMode === "3") {
      value = "stop";
    } else {
      throw new Error("Invalid work mode value");
    }

    const command = {
      code: "control",
      value,
    };

    const response = await tuya.request({
      path: `/v1.0/iot-03/devices/${device_id}/commands`,
      method: "POST",
      body: {
        commands: [command],
      },
    });

    if (response.success) {
      const updateQuery = `UPDATE device SET work_mode = ? WHERE device_id = ?`;
      connection.query(updateQuery, [value, device_id], (error, results) => {
        if (error) {
          throw error;
        }
        res.json({ message: "Work mode command sent successfully" });
      });
    } else {
      throw new Error("Failed to send work mode command");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const smartCurtainStatusHandler = async (req, res) => {
  try {
    const deviceId = req.body.device_id; // Get the 'device_id' from the request body
    if (!deviceId) {
      res.status(400).json({ error: "Missing device_id in the request body" });
      return;
    }

    const response = await tuya.request({
      path: `/v1.0/iot-03/devices/${deviceId}/status`,
      method: "GET",
    });

    if (response.success) {
      const statusData = response.result;
      let control = "open"; // Default control value is "open"
      let statusSwitch = "on"; // Update statusSwitch value if needed

      for (const data of statusData) {
        if (data.code === "control") {
          if (data.value === "close" || data.value === "stop") {
            control = data.value;
            statusSwitch = "off";
          }
          break;
        }
      }

      // Check device status in the database
      const selectQuery = `SELECT status FROM device WHERE device_id = ?`;
      connection.query(selectQuery, [deviceId], (error, results) => {
        if (error) {
          throw error;
        } else {
          const databaseStatus = results.length > 0 ? results[0].status : null;

          if (
            !(
              (statusSwitch === "on" && databaseStatus === "on") ||
              (statusSwitch === "off" && databaseStatus === "off")
            )
          ) {
            // Update the device status in the database
            const updateQuery = `UPDATE device SET status = ? WHERE device_id = ?`;

            connection.query(
              updateQuery,
              [statusSwitch, deviceId],
              (error, results) => {
                if (error) throw error;
                console.log("Control updated successfully");

                // Save log to the database
                const power = 12;
                const timestamp = new Date();
                const logStatus = statusSwitch;

                const insertQuery =
                  "INSERT INTO device_log (device_id, power, timestamp, status) VALUES (?, ?, ?, ?)";
                const insertValues = [deviceId, power, timestamp, logStatus];

                connection.query(
                  insertQuery,
                  insertValues,
                  (error, results) => {
                    if (error) throw error;
                    console.log("Log: " + logStatus + " inserted successfully");
                  }
                );
              }
            );
          }
        }
      });

      // Send response to the client here (if needed)
      res.json({ result: response.result });
    } else {
      throw new Error("Failed to get device status");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const smartFanSwitch = async (req, res) => {
  try {
    const { action, device_id } = req.body;
    const command = {
      code: "switch",
      value: action === "on" ? true : false,
    };

    const response = await tuya.request({
      path: `/v1.0/iot-03/devices/${device_id}/commands`,
      method: "POST",
      body: {
        commands: [command],
      },
    });

    if (response.success) {
      const message =
        action === "on"
          ? "Smart fan turned on successfully"
          : "Smart fan turned off successfully";
      res.json({ message });
    } else {
      throw new Error("Failed to control the Smart fan");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const smartFanSpeed = async (req, res) => {
  try {
    const { action, device_id } = req.body;
    const command = {
      code: "fan_speed",
      value: action, // Menggunakan nilai action sebagai nilai kecepatan
    };

    const response = await tuya.request({
      path: `/v1.0/iot-03/devices/${device_id}/commands`,
      method: "POST",
      body: {
        commands: [command],
      },
    });

    if (response.success) {
      const message = "successfully";
      res.json({ message });
    } else {
      throw new Error("Failed to control the fan speed");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const smartFanShake = async (req, res) => {
  try {
    const { shakeMode, device_id } = req.body;
    const command = {
      code: "switch_horizontal",
      value: shakeMode === "1" ? true : false,
    };

    const response = await tuya.request({
      path: `/v1.0/iot-03/devices/${device_id}/commands`,
      method: "POST",
      body: {
        commands: [command],
      },
    });

    if (response.success) {
      const message =
        shakeMode === "1"
          ? "Smart fan shake turned on successfully"
          : "Smart fan shake turned off successfully";
      res.json({ message });
    } else {
      throw new Error("Failed to control the Smart fan");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const smartFanStatusHandler = async (req, res) => {
  try {
    const deviceId = req.body.device_id; // Get the 'device_id' from the request body
    if (!deviceId) {
      res.status(400).json({ error: "Missing device_id in the request body" });
      return;
    }

    const response = await tuya.request({
      path: `/v1.0/iot-03/devices/${deviceId}/status`,
      method: "GET",
    });

    if (response.success) {
      res.json({ result: response.result });
      const statusData = response.result;
      let switch_fan = false;

      for (const data of statusData) {
        if (data.code === "switch") {
          switch_fan = data.value;
          break;
        }
      }

      const status = switch_fan ? "on" : "off";

      // Check device status in the database
      const selectQuery = `SELECT status FROM device WHERE device_id = ?`;
      connection.query(selectQuery, [deviceId], (error, results) => {
        if (error) {
          throw error;
        } else {
          const databaseStatus = results.length > 0 ? results[0].status : null;

          if (status === "on" && databaseStatus === "on") {
            // Device is already on, prevent inserting log for turning on
            // console.log('Device is already on, skip inserting log for turning on');
          } else if (status === "off" && databaseStatus === "off") {
            // Device is already off, prevent inserting log for turning off
            // console.log('Device is already off, skip inserting log for turning off');
          } else {
            // Update the device status in the database
            const updateQuery = `UPDATE device SET status = ? WHERE device_id = ?`;
            connection.query(
              updateQuery,
              [status, deviceId],
              (error, results) => {
                if (error) throw error;
                console.log("Status updated successfully");

                // Save log to the database
                const power = 12;
                const timestamp = new Date();
                const logStatus = switch_fan ? "on" : "off";

                const insertQuery =
                  "INSERT INTO device_log (device_id, power, timestamp, status) VALUES (?, ?, ?, ?)";
                const insertValues = [deviceId, power, timestamp, logStatus];

                connection.query(
                  insertQuery,
                  insertValues,
                  (error, results) => {
                    if (error) throw error;
                    console.log("Log: " + logStatus + " inserted successfully");
                  }
                );
              }
            );
          }
        }
      });
    } else {
      throw new Error("Failed to get device status");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const smartVacuumSwitch = async (req, res) => {
  try {
    const { action, device_id } = req.body;
    const command = {
      code: "power_go",
      value: action === "on" ? true : false,
    };

    const response = await tuya.request({
      path: `/v1.0/iot-03/devices/${device_id}/commands`,
      method: "POST",
      body: {
        commands: [command],
      },
    });

    if (response.success) {
      const message =
        action === "on"
          ? "Smart vacuum turned on successfully"
          : "Smart vacuum turned off successfully";
      res.json({ message });
    } else {
      throw new Error("Failed to control the Smart vacuum");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const smartVacuumWorkMode = async (req, res) => {
  try {
    const { workMode, device_id } = req.body;
    let value = "";

    if (workMode === "1") {
      value = "smart";
    } else if (workMode === "2") {
      value = "wall_follow";
    } else if (workMode === "3") {
      value = "spiral";
    } else if (workMode === "4") {
      value = "chargego";
    } else {
      throw new Error("Invalid work mode value");
    }

    const command = {
      code: "mode",
      value,
    };

    const response = await tuya.request({
      path: `/v1.0/iot-03/devices/${device_id}/commands`,
      method: "POST",
      body: {
        commands: [command],
      },
    });

    if (response.success) {
      const updateQuery = `UPDATE device SET work_mode = ? WHERE device_id = ?`;
      connection.query(updateQuery, [value, device_id], (error, results) => {
        if (error) {
          throw error;
        }
        res.json({ message: "Work mode command sent successfully" });
      });
    } else {
      throw new Error("Failed to send work mode command");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const smartVacuumStatusHandler = async (req, res) => {
  try {
    const deviceId = req.body.device_id;
    if (!deviceId) {
      res.status(400).json({ error: "Missing device_id in the request body" });
      return;
    }

    const response = await tuya.request({
      path: `/v1.0/iot-03/devices/${deviceId}/status`,
      method: "GET",
    });

    if (response.success) {
      res.json({ result: response.result });
      const statusData = response.result;
      let power_go = false;

      for (const data of statusData) {
        if (data.code === "power_go") {
          power_go = data.value;
          break;
        }
      }

      const status = power_go ? "on" : "off";

      // Check device status in the database
      const selectQuery = `SELECT status FROM device WHERE device_id = ?`;
      connection.query(selectQuery, [deviceId], (error, results) => {
        if (error) {
          throw error;
        } else {
          const databaseStatus = results.length > 0 ? results[0].status : null;

          if (status === "on" && databaseStatus === "on") {
            // Device is already on, prevent inserting log for turning on
            // console.log('Device is already on, skip inserting log for turning on');
          } else if (status === "off" && databaseStatus === "off") {
            // Device is already off, prevent inserting log for turning off
            // console.log('Device is already off, skip inserting log for turning off');
          } else {
            // Update the device status in the database
            const updateQuery = `UPDATE device SET status = ? WHERE device_id = ?`;
            connection.query(
              updateQuery,
              [status, deviceId],
              (error, results) => {
                if (error) throw error;
                console.log("Status updated successfully");

                // Save log to the database
                const power = 12;
                const timestamp = new Date();
                const logStatus = power_go ? "on" : "off";

                const insertQuery =
                  "INSERT INTO device_log (device_id, power, timestamp, status) VALUES (?, ?, ?, ?)";
                const insertValues = [deviceId, power, timestamp, logStatus];

                connection.query(
                  insertQuery,
                  insertValues,
                  (error, results) => {
                    if (error) throw error;
                    console.log("Log: " + logStatus + " inserted successfully");
                  }
                );
              }
            );
          }
        }
      });
    } else {
      throw new Error("Failed to get device status");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
};
