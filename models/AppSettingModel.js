/*global process*/
import globalHelper from "../misc/globalHelper.js";

let settings;

export default class settingModel {
  static async injectDB(conn) {
    if (settings) {
      return;
    }
    try {
      // eslint-disable-next-line require-atomic-updates
      settings = await conn.db(process.env.NS).collection("settings");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in settingModel: ${e}`
      );
    }
  }

  /**
   * Inserts an setting into the `settings` collection, with the following fields:
   * @param {string} settingID - The _id of the setting in the `settings` collection.
   * @param {string} name - The name of the settings.
   * @param {string} description - The long description of the settings.
   * @param {Object} values - An object containing the detailed values of the settings.
   * @param {Boolean} isActive - A switch to turn on/off the setting.
   * @param {string} dateUpdated - The date on which the setting was last updated.
   * @param {Object} updateBy - The user that last updated the setting.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addsetting(
    settingID,
    name,
    description,
    values,
    isActive,
    dateUpdated,
    updateBy
  ) {
    try {
      // TODO: Create/Update settings
      // Construct the setting document to be inserted.
      const settingDoc = {
        settingID: settingID,
        name: name,
        description: description,
        values: values,
        isActive: isActive,
        dateUpdated: dateUpdated,
        updateBy: updateBy
      };

      return await settings.insertOne(settingDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to save setting: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the setting in the setting collection.
   * @param {string} settingID - The _id of the setting in the `settings` collection.
   * @param {string} name - The name of the settings.
   * @param {string} description - The long description of the settings.
   * @param {Object} values - An object containing the detailed values of the settings.
   * @param {Boolean} isActive - A switch to turn on/off the setting.
   * @param {string} dateUpdated - The date on which the setting was last updated.
   * @param {Object} updateBy - The user that last updated the setting.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updatesetting(
    settingID,
    description,
    values,
    isActive,
    user
  ) {
    try {
      // TODO: Create/Update settings
      // Use the settingId and status to select the proper setting, then update.

      let date_upd = globalHelper.currentDateTime();

      const updateResponse = await settings.updateOne(
        { settingID: settingID },
        {
          $set: {
            description: description,
            values: values,
            isActive: isActive,
            dateUpdated: date_upd,
            updateBy: user
          }
        }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update setting: ${e}`);
      return { error: e };
    }
  }

  //deactivate a specific setting
  static async deletesetting(settingID) {
    /**
    Ticket: deactivate setting. Only active settings can be deactivated.
    */

    try {
      // TODO Ticket: deactivate setting
      const deleteResponse = await settings.updateOne(
        { settingID: settingID},
        { $set: { isActive: false } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to void setting: ${e}`);
      return { error: e };
    }
  }


  //retrieve all settings
  static async getAllsettings() {
    /**
    Todo: retrieve all settings from the database using slow loading. Limit to first 20
    */
    try {
      const pipeline = [
        {
          $sort: { settingID: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //settings.readConcern

      const aggregateResult = await settings.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();

    } catch (e) {
      console.error(`Unable to retrieve settings: ${e}`);
      return { error: e };
    }
  }
}

/**
 * Success/Error return object
 * @typedef DAOResponse
 * @property {boolean} [success] - Success
 * @property {string} [error] - Error
 */

