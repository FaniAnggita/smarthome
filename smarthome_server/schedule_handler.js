// handlers.js
const { TuyaContext } = require("../src");
const connection = require("./database");

const tuya = new TuyaContext({
  baseUrl: "https://openapi.tuyaus.com",
  accessKey: "57kwg3m99pfuvhwwdqcq",
  secretKey: "964a6cb572ed421f8fe998b8b31b55c9",
});

const lampStatusScheduleHandler = async (req, res) => {
  try {
    const { device_id } = req.body;

    if (!device_id) {
      res.status(400).json({ error: "Missing device_id in the request body" });
      return;
    }

    // Query the database to get schedule data
    const query = `SELECT time_on, time_off FROM schedule WHERE device_id = ?`;
    connection.query(query, [device_id], (error, results) => {
      if (error) {
        throw error;
      } else {
        if (results.length > 0) {
          const { time_on, time_off } = results[0];

          // Check if the current time matches the scheduled time
          const currentTime = new Date();
          const currentHour = currentTime.getHours();
          const currentMinute = currentTime.getMinutes();

          let shouldTurnOn = false;
          let shouldTurnOff = false;

          if (time_on !== null) {
            const [onHour, onMinute] = time_on.split(":");
            if (
              parseInt(onHour) === currentHour &&
              parseInt(onMinute) === currentMinute
            ) {
              shouldTurnOn = true;
            }
          }

          if (time_off !== null) {
            const [offHour, offMinute] = time_off.split(":");
            if (
              parseInt(offHour) === currentHour &&
              parseInt(offMinute) === currentMinute
            ) {
              shouldTurnOff = true;
            }
          }

          // Perform actions based on the scheduled time
          if (shouldTurnOn) {
            // Send command to turn on the lamp
            const command = {
              code: "switch_led",
              value: true,
            };

            tuya
              .request({
                path: `/v1.0/iot-03/devices/${device_id}/commands`,
                method: "POST",
                body: {
                  commands: [command],
                },
              })
              .then((response) => {
                if (response.success) {
                  res.json({
                    message: "Lamp turned on based on schedule",
                    time_on,
                    time_off,
                  });
                } else {
                  throw new Error(
                    "Failed to turn on the lamp based on schedule"
                  );
                }
              })
              .catch((error) => {
                throw error;
              });
          } else if (shouldTurnOff) {
            // Send command to turn off the lamp
            const command = {
              code: "switch_led",
              value: false,
            };

            tuya
              .request({
                path: `/v1.0/iot-03/devices/${device_id}/commands`,
                method: "POST",
                body: {
                  commands: [command],
                },
              })
              .then((response) => {
                if (response.success) {
                  res.json({
                    message: "Lamp turned off based on schedule",
                    time_on,
                    time_off,
                  });
                } else {
                  throw new Error(
                    "Failed to turn off the lamp based on schedule"
                  );
                }
              })
              .catch((error) => {
                throw error;
              });
          } else {
            res.json({
              message: "No scheduled action at the current time",
              time_on,
              time_off,
            });
          }
        } else {
          res.json({ time_on: null, time_off: null });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const curtainStatusScheduleHandler = async (req, res) => {
  try {
    const { device_id } = req.body;

    if (!device_id) {
      res.status(400).json({ error: "Missing device_id in the request body" });
      return;
    }

    // Query the database to get schedule data
    const query = `SELECT time_on, time_off FROM schedule WHERE device_id = ?`;
    connection.query(query, [device_id], (error, results) => {
      if (error) {
        throw error;
      } else {
        if (results.length > 0) {
          const { time_on, time_off } = results[0];

          // Check if the current time matches the scheduled time
          const currentTime = new Date();
          const currentHour = currentTime.getHours();
          const currentMinute = currentTime.getMinutes();

          let shouldTurnOn = false;
          let shouldTurnOff = false;

          if (time_on !== null) {
            const [onHour, onMinute] = time_on.split(":");
            if (
              parseInt(onHour) === currentHour &&
              parseInt(onMinute) === currentMinute
            ) {
              shouldTurnOn = true;
            }
          }

          if (time_off !== null) {
            const [offHour, offMinute] = time_off.split(":");
            if (
              parseInt(offHour) === currentHour &&
              parseInt(offMinute) === currentMinute
            ) {
              shouldTurnOff = true;
            }
          }

          // Perform actions based on the scheduled time
          if (shouldTurnOn) {
            // Send command to control the lamp
            const command = {
              code: "control",
              value: "open",
            };

            tuya
              .request({
                path: `/v1.0/iot-03/devices/${device_id}/commands`,
                method: "POST",
                body: {
                  commands: [command],
                },
              })
              .then((response) => {
                if (response.success) {
                  res.json({
                    message: "Lamp turned on based on schedule",
                    time_on,
                    time_off,
                  });
                } else {
                  throw new Error(
                    "Failed to turn on the lamp based on schedule"
                  );
                }
              })
              .catch((error) => {
                throw error;
              });
          } else if (shouldTurnOff) {
            // Send command to control the lamp
            const command = {
              code: "control",
              value: "close",
            };

            tuya
              .request({
                path: `/v1.0/iot-03/devices/${device_id}/commands`,
                method: "POST",
                body: {
                  commands: [command],
                },
              })
              .then((response) => {
                if (response.success) {
                  res.json({
                    message: "Lamp turned off based on schedule",
                    time_on,
                    time_off,
                  });
                } else {
                  throw new Error(
                    "Failed to turn off the lamp based on schedule"
                  );
                }
              })
              .catch((error) => {
                throw error;
              });
          } else {
            res.json({
              message: "No scheduled action at the current time",
              time_on,
              time_off,
            });
          }
        } else {
          res.json({ time_on: null, time_off: null });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const fanStatusScheduleHandler = async (req, res) => {
  try {
    const { device_id } = req.body;

    if (!device_id) {
      res.status(400).json({ error: "Missing device_id in the request body" });
      return;
    }

    // Query the database to get schedule data
    const query = `SELECT time_on, time_off FROM schedule WHERE device_id = ?`;
    connection.query(query, [device_id], (error, results) => {
      if (error) {
        throw error;
      } else {
        if (results.length > 0) {
          const { time_on, time_off } = results[0];

          // Check if the current time matches the scheduled time
          const currentTime = new Date();
          const currentHour = currentTime.getHours();
          const currentMinute = currentTime.getMinutes();

          let shouldTurnOn = false;
          let shouldTurnOff = false;

          if (time_on !== null) {
            const [onHour, onMinute] = time_on.split(":");
            if (
              parseInt(onHour) === currentHour &&
              parseInt(onMinute) === currentMinute
            ) {
              shouldTurnOn = true;
            }
          }

          if (time_off !== null) {
            const [offHour, offMinute] = time_off.split(":");
            if (
              parseInt(offHour) === currentHour &&
              parseInt(offMinute) === currentMinute
            ) {
              shouldTurnOff = true;
            }
          }

          // Perform actions based on the scheduled time
          if (shouldTurnOn) {
            // Send command to turn on the lamp
            const command = {
              code: "switch",
              value: true,
            };

            tuya
              .request({
                path: `/v1.0/iot-03/devices/${device_id}/commands`,
                method: "POST",
                body: {
                  commands: [command],
                },
              })
              .then((response) => {
                if (response.success) {
                  res.json({
                    message: "Lamp turned on based on schedule",
                    time_on,
                    time_off,
                  });
                } else {
                  throw new Error(
                    "Failed to turn on the lamp based on schedule"
                  );
                }
              })
              .catch((error) => {
                throw error;
              });
          } else if (shouldTurnOff) {
            // Send command to turn off the lamp
            const command = {
              code: "switch",
              value: false,
            };

            tuya
              .request({
                path: `/v1.0/iot-03/devices/${device_id}/commands`,
                method: "POST",
                body: {
                  commands: [command],
                },
              })
              .then((response) => {
                if (response.success) {
                  res.json({
                    message: "Lamp turned off based on schedule",
                    time_on,
                    time_off,
                  });
                } else {
                  throw new Error(
                    "Failed to turn off the lamp based on schedule"
                  );
                }
              })
              .catch((error) => {
                throw error;
              });
          } else {
            res.json({
              message: "No scheduled action at the current time",
              time_on,
              time_off,
            });
          }
        } else {
          res.json({ time_on: null, time_off: null });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const vacuumStatusScheduleHandler = async (req, res) => {
  try {
    const { device_id } = req.body;

    if (!device_id) {
      res.status(400).json({ error: "Missing device_id in the request body" });
      return;
    }

    // Query the database to get schedule data
    const query = `SELECT time_on, time_off FROM schedule WHERE device_id = ?`;
    connection.query(query, [device_id], (error, results) => {
      if (error) {
        throw error;
      } else {
        if (results.length > 0) {
          const { time_on, time_off } = results[0];

          // Check if the current time matches the scheduled time
          const currentTime = new Date();
          const currentHour = currentTime.getHours();
          const currentMinute = currentTime.getMinutes();

          let shouldTurnOn = false;
          let shouldTurnOff = false;

          if (time_on !== null) {
            const [onHour, onMinute] = time_on.split(":");
            if (
              parseInt(onHour) === currentHour &&
              parseInt(onMinute) === currentMinute
            ) {
              shouldTurnOn = true;
            }
          }

          if (time_off !== null) {
            const [offHour, offMinute] = time_off.split(":");
            if (
              parseInt(offHour) === currentHour &&
              parseInt(offMinute) === currentMinute
            ) {
              shouldTurnOff = true;
            }
          }

          // Perform actions based on the scheduled time
          if (shouldTurnOn) {
            // Send command to turn on the lamp
            const command = {
              code: "power_go",
              value: true,
            };

            tuya
              .request({
                path: `/v1.0/iot-03/devices/${device_id}/commands`,
                method: "POST",
                body: {
                  commands: [command],
                },
              })
              .then((response) => {
                if (response.success) {
                  res.json({
                    message: "Lamp turned on based on schedule",
                    time_on,
                    time_off,
                  });
                } else {
                  throw new Error(
                    "Failed to turn on the lamp based on schedule"
                  );
                }
              })
              .catch((error) => {
                throw error;
              });
          } else if (shouldTurnOff) {
            // Send command to turn off the lamp
            const command = {
              code: "power_go",
              value: false,
            };

            tuya
              .request({
                path: `/v1.0/iot-03/devices/${device_id}/commands`,
                method: "POST",
                body: {
                  commands: [command],
                },
              })
              .then((response) => {
                if (response.success) {
                  res.json({
                    message: "Lamp turned off based on schedule",
                    time_on,
                    time_off,
                  });
                } else {
                  throw new Error(
                    "Failed to turn off the lamp based on schedule"
                  );
                }
              })
              .catch((error) => {
                throw error;
              });
          } else {
            res.json({
              message: "No scheduled action at the current time",
              time_on,
              time_off,
            });
          }
        } else {
          res.json({ time_on: null, time_off: null });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  lampStatusScheduleHandler,
  curtainStatusScheduleHandler,
  fanStatusScheduleHandler,
  vacuumStatusScheduleHandler,
};
