// handlers.js
const { TuyaContext } = require("../src");
const connection = require("./database");

const tuya = new TuyaContext({
  baseUrl: "https://openapi.tuyaus.com",
  accessKey: "57kwg3m99pfuvhwwdqcq",
  secretKey: "964a6cb572ed421f8fe998b8b31b55c9",
});

// Lamp on/off handler
const lampSwitchHandler = async (req, res) => {
  try {
    const { action, device_id } = req.body;
    const command = {
      code: "switch_led",
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
          ? "Lamp turned on successfully"
          : "Lamp turned off successfully";
      res.json({ message });
    } else {
      throw new Error("Failed to control the lamp");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// work mode
const workModeHandler = async (req, res) => {
  try {
    const { workMode, device_id } = req.body;
    let value = "";

    if (workMode === "2") {
      value = "white";
    } else if (workMode === "1") {
      value = "colour";
    } else {
      throw new Error("Invalid work mode value");
    }

    const command = {
      code: "work_mode",
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

// brightness
const lampBrightHandler = async (req, res) => {
  try {
    const { action, device_id } = req.body; // Get the 'action' and 'device_id' from the client request body
    const command = {
      code: "bright_value_v2",
      value: action,
    };

    const response = await tuya.request({
      path: `/v1.0/iot-03/devices/${device_id}/commands`, // Use the 'device_id' from the client request body
      method: "POST",
      body: {
        commands: [command],
      },
    });

    if (response.success) {
      const message = "successfully";
      res.json({ message });
    } else {
      throw new Error("Failed to control the lamp");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// color
const lampColorHandler = async (req, res) => {
  try {
    const { h, s, v, device_id } = req.body; // Get 'h', 's', 'v', and 'device_id' from the client request body
    const command = {
      code: "colour_data_v2",
      value: {
        h: parseInt(h),
        s: parseInt(s),
        v: parseInt(v),
      },
    };

    const response = await tuya.request({
      path: `/v1.0/iot-03/devices/${device_id}/commands`, // Use the 'device_id' from the client request body
      method: "POST",
      body: {
        commands: [command],
      },
    });

    if (response.success) {
      res.json({ message: "Lamp color changed successfully" });
    } else {
      throw new Error("Failed to change lamp color");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const lampStatusHandler = async (req, res) => {
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
      let switch_led_value = false;

      for (const data of statusData) {
        if (data.code === "switch_led") {
          switch_led_value = data.value;
          break;
        }
      }

      const status = switch_led_value ? "on" : "off";

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
                const logStatus = switch_led_value ? "on" : "off";

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

const lampScheduleHandler = async (req, res) => {
  try {
    const { device_id, statusTimeOn, timeOn, statusTimeOff, timeOff } =
      req.body;

    let timeOnValue = null;
    let timeOffValue = null;

    if (!device_id) {
      res.status(400).json({ error: "Missing device_id in the request body" });
      return;
    }

    if (statusTimeOn === "1") {
      timeOnValue = timeOn;
    }

    if (statusTimeOff === "1") {
      timeOffValue = timeOff;
    }

    // Check if a schedule already exists in the database
    const checkQuery = `SELECT * FROM schedule WHERE device_id = ?`;
    connection.query(checkQuery, [device_id], (error, results) => {
      if (error) {
        throw error;
      } else {
        if (results.length > 0) {
          // If a schedule exists, update the existing data
          const updateQuery = `UPDATE schedule SET time_on = ?, time_off = ? WHERE device_id = ?`;
          connection.query(
            updateQuery,
            [timeOnValue, timeOffValue, device_id],
            (error, results) => {
              if (error) {
                throw error;
              } else {
                res.json({ message: "Schedule updated successfully" });
              }
            }
          );
        } else {
          // If no schedule exists, insert new data
          const insertQuery = `INSERT INTO schedule (device_id, time_on, time_off) VALUES (?, ?, ?)`;
          connection.query(
            insertQuery,
            [device_id, timeOnValue, timeOffValue],
            (error, results) => {
              if (error) {
                throw error;
              } else {
                res.json({ message: "Schedule saved successfully" });
              }
            }
          );
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTotalDeviceStatus = (req, res) => {
  const query = `
    SELECT
      SUM(CASE WHEN status = 'on' THEN 1 ELSE 0 END) AS total_on_devices,
      SUM(CASE WHEN status = 'off' THEN 1 ELSE 0 END) AS total_off_devices
    FROM
      DEVICE;
  `;

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      const total_on_devices = results[0].total_on_devices;
      const total_off_devices = results[0].total_off_devices;
      res.json({ total_on_devices, total_off_devices });
    }
  });
};

const getEneryConsumption = (req, res) => {
  const query = `
    SELECT
      SUM(sub.total_cost) AS total_cost,
      SUM(sub.total_kwh) AS total_kwh,
      SUM(sub.total_duration) AS total_duration
    FROM (
      SELECT
        device_id,
        HOUR(TIMEDIFF(MAX(timestamp), MIN(timestamp))) * (MAX(power) / 1000) * 415 AS total_cost,
        HOUR(TIMEDIFF(MAX(timestamp), MIN(timestamp))) * (MAX(power) / 1000) AS total_kwh,
        HOUR(TIMEDIFF(MAX(timestamp), MIN(timestamp))) AS total_duration
      FROM device_log
      WHERE status = 'on' AND MONTH(timestamp) <= MONTH(CURDATE())
      GROUP BY device_id
    ) AS sub;
  `;

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      const total_cost = results[0].total_cost;
      const total_kwh = results[0].total_kwh;
      const total_duration = results[0].total_duration;
      res.json({ total_cost, total_kwh, total_duration });
    }
  });
};

const getEnergyConsumptionPerHour = (req, res) => {
  const query = `
    SELECT
      date,
      hour,
      SUM(total_cost) AS total_cost_per_hour,
      SUM(total_kwh) AS total_kwh_per_hour
    FROM
      (SELECT
          DATE(timestamp) AS date,
          HOUR(timestamp) AS hour,
          (SUM(power) / 1000) * 415 AS total_cost,
          SUM(power) / 1000 AS total_kwh
      FROM device_log
      WHERE status = 'on' AND DATE(timestamp) = CURDATE()
      GROUP BY DATE(timestamp), HOUR(timestamp)) AS subquery
    GROUP BY date, hour;
  `;

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json(results);
    }
  });
};

const getEnergyConsumptionPerWeek = (req, res) => {
  const query = `
    SELECT
      DATE(timestamp) AS date,
      (SUM(power) / 1000) * 415 AS total_cost_per_day,
      SUM(power) / 1000 AS total_kwh_per_day
    FROM device_log
    WHERE status = 'on' AND DATE(timestamp) BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE()
    GROUP BY DATE(timestamp);
  `;

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json(results);
    }
  });
};

const getEnergyConsumptionPerMonth = (req, res) => {
  const query = `
    SELECT
      YEAR(timestamp) AS year,
      MONTH(timestamp) AS month,
      (SUM(power) / 1000) * 415 AS total_cost_per_month,
      SUM(power) / 1000 AS total_kwh_per_month
    FROM device_log
    WHERE status = 'on' AND YEAR(timestamp) = YEAR(CURDATE())
    GROUP BY YEAR(timestamp), MONTH(timestamp);
  `;

  connection.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json(results);
    }
  });
};

const getDeviceDataHandler = (req, res) => {
  const selectQuery = `
    SELECT d.id, d.device_id, d.work_mode, d.power, d.status, s.time_on, s.time_off
    FROM device AS d
    LEFT JOIN schedule AS s ON d.device_id = s.device_id
  `;

  connection.query(selectQuery, (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      if (results.length > 0) {
        res.json({ devices: results });
      } else {
        res.status(404).json({ error: "No devices found" });
      }
    }
  });
};

module.exports = {
  lampSwitchHandler,
  workModeHandler,
  lampColorHandler,
  lampBrightHandler,
  lampStatusHandler,
  lampScheduleHandler,
  getTotalDeviceStatus,
  getEneryConsumption,
  getEnergyConsumptionPerHour,
  getEnergyConsumptionPerWeek,
  getEnergyConsumptionPerMonth,
  getDeviceDataHandler,
};
