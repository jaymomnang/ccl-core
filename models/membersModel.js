/*global process*/
import globalHelper from "../misc/globalHelper.js";

let members;
let _ns;

export default class memberModel {
  static async injectDB(conn) {
    if (members) {
      return;
    }
    try {
      _ns = await conn.db(process.env.NS);
      // eslint-disable-next-line require-atomic-updates
      members = await conn.db(process.env.NS).collection("members");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in memberModel: ${e}`
      );
    }
  }

  /**
   * Inserts an member into the `members` collection, with the following fields:

   * @param {string} memberID - The _id of the member in the `members` collection.
   * @param {String} firstname - The first name of the member.
   * @param {String} lastname - The last name of the member.
   * @param {String} phoneno - The member's phone number.
   * @param {String} email - The member's email.
   * @param {String} address - The member's address.
   * @param {String} regdate - The registration date.
   * @param {String} status - Member's current status.
   * @param {string} w_date - Membership withdrawal date.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addmember(
    memberID,
    firstname,
    lastname,
    phoneno,
    email,
    address,
    regdate,
    status,
    w_date
  ) {
    try {
      // TODO: Create/Update members
      // Construct the member document to be inserted.
      let date_upd = globalHelper.currentDateTime();

      const memberDoc = {
        memberID: memberID,
        firstname: firstname,
        lastname: lastname,
        phoneno: phoneno,
        email: email,
        address: address,
        regdate: regdate,
        status: status,
        w_date: w_date,        
        dateCreated: date_upd,
        createdBy: firstname + " " + lastname,
        dateUpdated: date_upd,
        updateBy: firstname + " " + lastname
      };

      return await members.insertOne(memberDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post member: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the member in the member collection.
   * @param {string} memberID - The _id of the member in the `members` collection.
   * @param {String} firstname - The first name of the member.
   * @param {String} lastname - The last name of the member.
   * @param {String} phoneno - The member's phone number.
   * @param {String} email - The member's email.
   * @param {String} address - The member's address.
   * @param {String} status - Member's current status.
   * @param {string} w_date - Membership withdrawal date.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updatemember(
    memberID,
    firstname,
    lastname,
    phoneno,
    email,
    address,
    status,
    w_date
  ) {
    try {
      // TODO: Create/Update members
      // Use the memberId and status to select the proper member, then update.

      let date_upd = globalHelper.currentDateTime();

      const updateResponse = await members.updateOne(
        { memberID: memberID, status: "ACTIVE" },
        {
          $set: {
            memberID: memberID,
            phoneno: phoneno,
            email: email,
            address: address,
            status: status,
            w_date: w_date,        
            dateUpdated: date_upd,
            updateBy: firstname + " " + lastname
          }
        }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update member: ${e}`);
      return { error: e };
    }
  }

  //void a specific member
  static async deletemember(memberID) {
    /**
    Ticket: void member. Only open members can be voided.
    */

    try {
      // TODO Ticket: void member
      const deleteResponse = await members.updateOne(
        { memberID: memberID, status: "ACTIVE" },
        { $set: { status: "INACTIVE" } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to deactivate membership: ${e}`);
      return { error: e };
    }
  }


  //retrieve all members
  static async getAllmembers() {
    /**
    Todo: retrieve all members from the database using slow loading.
    */
    try {
      const pipeline = [
        {
          $sort: { memberID: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority";
      const aggregateResult = await members.aggregate(pipeline, {readConcern});
      return await aggregateResult.toArray();

    } catch (e) {
      console.error(`Unable to retrieve members: ${e}`);
      return { error: e };
    }
  }

  //retrieve an member using the transaction Id
  static async getmemberById(Id) {   
    try {
      const pipeline = [
        {
          $match: { memberID: Id }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //members.readConcern
      const aggregateResult = await members.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve member: ${e}`);
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
    const { poolSize, wtimeout } = members.s.db.serverConfig.s.options
    let response = {
      poolSize,
      wtimeout,
      authInfo,
    }
    return response
  }


/**
   *
   * @param {Object} filters - The search parameter to use in the query. Comes
   * in the form of `{cast: { $in: [...castMembers]}}`
   * @param {number} page - The page of movies to retrieve.
   * @param {number} moviesPerPage - The number of movies to display per page.
   * @returns {FacetedSearchReturn} FacetedSearchReturn
   */
  static async facetedSearch({
    filters = null,
    page = 0,
    moviesPerPage = 20,
  } = {}) {
    if (!filters || !filters.dates) {
      throw new Error("Must specify dates to filter by.")
    }
    const matchStage = { $match: filters }
    const sortStage = { $sort: { "memberID": -1 } }
    const countingPipeline = [matchStage, sortStage, { $count: "count" }]
    const skipStage = { $skip: moviesPerPage * page }
    const limitStage = { $limit: moviesPerPage }
    const facetStage = {
      $facet: {        
        customer: [
          {
            $bucket: {
              groupBy: "$firstname",
              boundaries: [0, 50, 70, 90, 100],
              default: "other",
              output: {
                count: { $sum: 1 },
              },
            },
          },
        ]
      },
    }

    /**
    Ticket: Faceted Search

    Please append the skipStage, limitStage, and facetStage to the queryPipeline
    (in that order). You can accomplish this by adding the stages directly to
    the queryPipeline.

    The queryPipeline is a Javascript array, so you can use push() or concat()
    to complete this task, but you might have to do something about `const`.
    */

    const queryPipeline = [
      matchStage,
      sortStage,
      // TODO Ticket: Faceted Search
      // Add the stages to queryPipeline in the correct order.
      skipStage,
      limitStage,
      facetStage
    ]

    try {
      const results = await (await members.aggregate(queryPipeline)).next()
      const count = await (await members.aggregate(countingPipeline)).next()
      return {
        ...results,
        ...count,
      }
    } catch (e) {
      return { error: "Results too large, be more restrictive in filter" }
    }
    
  }
}

/**
 * Success/Error return object
 * @typedef DAOResponse
 * @property {boolean} [success] - Success
 * @property {string} [error] - Error
 */