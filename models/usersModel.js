
/*global process*/
import globalHelper from "../misc/globalHelper.js";

let users;
let _ns;

export default class userModel {
  static async injectDB(conn) {
    if (users) {
      return;
    }
    try {
      _ns = await conn.db(process.env.NS);
      // eslint-disable-next-line require-atomic-updates      
      users = await conn.db(process.env.NS).collection("users");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in userModel: ${e}`
      );
    }
  }

  /**
   * Inserts a user account into the `users` collection, with the following fields:
   * @param {string} email - The email of the user in the `users` collection.
   * @param {string} firstname - The first name of the user.
   * @param {string} lastname - The last name of the user.
   * @param {string} pwd - The users's authentication pwd.
   * @param {string} sl - The user's authentication key. 
   * @param {string} dateCreated - Date user account was created.
   * @param {Boolean} isActive - A switch to indicate if user account has been activated.
   * @param {string} lastLoginDate - The date the user logged in last.
   * @param {Object} status - The status of the user account.
   * @param {Object} roles - The roles and permission applied to the user account.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async adduser(
    email,
    firstname,
    lastname,
    pwd,
    sl,
    dateCreated,
    isActive,
    lastLoginDate,
    status,
    roles
  ) {
    try {
      // TODO: Create user account
      // Construct the user document to be inserted.
      const userDoc = {
        email: email,
        firstname: firstname,
        lastname: lastname,
        pwd: pwd,
        sl: sl,
        dateCreated: dateCreated,
        isActive: isActive,
        lastLoginDate: lastLoginDate,
        status: status,
        roles: roles
      };

      return await users.insertOne(userDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to create user account: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates a user account in the user collection.
   * @param {string} email - The email of the user in the `users` collection.
   * @param {string} pwd - The users's authentication pwd.
   * @param {Boolean} isActive - A switch to indicate if user account has been activated.
   * @param {Object} status - The status of the user account.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updateuser(
    email,
    pwd,
    isActive,
    status
  ) {
    try {
      // TODO: Update users
      // Use the email to select the proper user, then update.

      let date_upd = globalHelper.currentDateTime();

      const updateResponse = await users.updateOne(
        { userID: email, pwd: pwd },
        {
          $set: {
            status: status,
            isActive: isActive,
            lastLoginDate: date_upd
          }
        }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update user account: ${e}`);
      return { error: e };
    }
  }

  //suspend a specific user account
  static async suspendUser(email) {
    /**
    Ticket: suspend user account. 
    */

    try {
      // TODO Ticket: suspend a user
      const deleteResponse = await users.updateOne(
        { email: email},
        { $set: { isActive: false } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to suspend user account: ${e}`);
      return { error: e };
    }
  }


  //retrieve all users
  static async getAllusers() {
    /**
    Todo: retrieve all users from the database using slow loading.
    */
    try {
      const pipeline = [
        {
          $sort: { firstname: 1, lastname: 1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //users.readConcern
      
      const aggregateResult = await users.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray()
      
    } catch (e) {
      console.error(`Unable to retrieve users: ${e}`);
      return { error: e };
    }
  }

  //retrieve a specific user account
  static async getUser(email, token) {
    /**
    Todo: 1. retrieve a specific user account.
    2. use the sl to decrypt the pwd
    */
    try {
      // Return the matching user account.
      const pipeline = [
        {
          $match: {email: email, pwd: token}
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //users.readConcern

      const aggregateResult = await users.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve users: ${e}`);
      return { error: e };
    }
  }


//retrieve a specific user account by their id/email
static async getuserById(email) {
  /**
  Todo: 1. retrieve a specific user account.
  2. use the sl to decrypt the pwd
  */
  try {
    // Return the matching user account.
    const pipeline = [
      {
        $match: {email: email}
      }
    ];

    // Use a more durable Read Concern here to make sure this data is not stale.
    const readConcern = "majority"; //users.readConcern

    const aggregateResult = await users.aggregate(pipeline, {
      readConcern
    });

    return await aggregateResult.toArray();
  } catch (e) {
    console.error(`Unable to retrieve users: ${e}`);
    return { error: e };
  }
}


  static async getusers() {
    /**
    Todo: retrieve user accounts.
    */
    try {
      // Return the all user accounts.
      const pipeline = [
        {
          $sort: {firstname: -1, lastname: -1}
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //users.readConcern

      const aggregateResult = await users.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve users: ${e}`);
      return { error: e };
    }
  }

  /**
   * Retrieves the connection pool size, write concern and user roles on the
   * current client.
   * @returns {Promise<ConfigurationResult>} An object with configuration details.
   */
  static async getConfiguration() {
    const roleInfo = await _ns.command({ connectionStatus: 1 })
    const authInfo = roleInfo.authInfo.authenticatedUserRoles[0]
    const { poolSize, wtimeout } = users.s.db.serverConfig.s.options
    let response = {
      poolSize,
      wtimeout,
      authInfo,
    }
    return response
  }

}

/**
 * Success/Error return object
 * @typedef DAOResponse
 * @property {boolean} [success] - Success
 * @property {string} [error] - Error
 */


