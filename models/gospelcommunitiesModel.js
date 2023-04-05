/*global process*/
import globalHelper from "../misc/globalHelper.js";

let gospelcommunities;
let _ns;

export default class gospelcommunityModel {
  static async injectDB(conn) {
    if (gospelcommunities) {
      return;
    }
    try {
      _ns = await conn.db(process.env.NS);
      // eslint-disable-next-line require-atomic-updates
      gospelcommunities = await conn.db(process.env.NS).collection("gospelcommunities");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in gospelcommunityModel: ${e}`
      );
    }
  }

  /**
   * Inserts an gospelcommunity into the `gospelcommunities` collection, with the following fields:
   * @param {string} gospelcommunityID - The _id of the gospelcommunity in the `gospelcommunities` collection.
   * @param {Object} user - An object containing the user's name and email.
   * @param {string} gcName - The name of the gospel community.
   * @param {string} cordinator - The cordinator of the gospel community.
   * @param {string} assistant - The assistant cordinator of the gospel community.
   * @param {string} meetingDate - The meeting date of the gospel community.
   * @param {string} meetingTime - The meeting time of the gospel community.
   * @param {string} venue - The meeting venue of the gospel community.
   * @param {Object} members - Members of the gospelcommunity.
   * @param {Object} studyTopics - The various study topics of the gc.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addgospelcommunity(
    gospelcommunityID,
    user,
    gcName,
    cordinator,
    assistant,
    meetingDate,
    meetingTime,
    venue,
    members,
    studyTopics
  ) {
    try {
      // TODO: Create/Update gospelcommunities
      // Construct the gospelcommunity document to be inserted.
      let date_upd = globalHelper.currentDateTime();

      const gospelcommunityDoc = {
        gospelcommunityID: gospelcommunityID,
        gcName: gcName,
        cordinator: cordinator,
        assistant: assistant,
        meetingDate: meetingDate,
        venue: venue,
        members: members,
        meetingTime: meetingTime,
        studyTopics: studyTopics,
        dateCreated: date_upd,
        createdBy: user,
        dateUpdated: date_upd,
        updateBy: user,
        status: "ACTIVE"
      };

      return await gospelcommunities.insertOne(gospelcommunityDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post gospelcommunity: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the gospelcommunity in the gospelcommunity collection.
   * @param {string} gospelcommunityID - The _id of the gospelcommunity in the `gospelcommunities` collection.
   * @param {Object} user - An object containing the user's name and email.
   * @param {string} gcName - The name of the gospel community.
   * @param {string} cordinator - The cordinator of the gospel community.
   * @param {string} assistant - The assistant cordinator of the gospel community.
   * @param {string} meetingDate - The meeting date of the gospel community.
   * @param {string} meetingTime - The meeting time of the gospel community.
   * @param {string} venue - The meeting venue of the gospel community.
   * @param {Object} members - Members of the gospelcommunity.
   * @param {Object} studyTopics - The various study topics of the gc.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updategospelcommunity(
    gospelcommunityID,
    user,
    gcName,
    cordinator,
    assistant,
    meetingDate,
    meetingTime,
    venue,
    members,
    studyTopics
  ) {
    try {
      // TODO: Create/Update gospelcommunities
      // Use the gospelcommunityId and status to select the proper gospelcommunity, then update.

      let date_upd = globalHelper.currentDateTime();

      const updateResponse = await gospelcommunities.updateOne(
        { gospelcommunityID: gospelcommunityID, status: "ACTIVE" },
        {
          $set: {
            gcName: gcName,
            cordinator: cordinator,
            assistant: assistant,
            meetingDate: meetingDate,
            venue: venue,
            members: members,
            meetingTime: meetingTime,
            studyTopics: studyTopics,
            dateUpdated: date_upd,
            updateBy: user
          }
        }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update gospelcommunity: ${e}`);
      return { error: e };
    }
  }

  //void a specific gospelcommunity
  static async deletegospelcommunity(gospelcommunityID) {
    /**
    Ticket: void gospelcommunity. Only open gospelcommunities can be voided.
    */

    try {
      // TODO Ticket: void gospelcommunity
      const deleteResponse = await gospelcommunities.updateOne(
        { gospelcommunityID: gospelcommunityID, status: "ACTIVE" },
        { $set: { status: "INACTIVE" } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to void gospelcommunity: ${e}`);
      return { error: e };
    }
  }


  //retrieve all gospelcommunities
  static async getAllgospelcommunities() {
    /**
    Todo: retrieve all gospelcommunities from the database using slow loading.
    */
    try {
      const pipeline = [
        {
          $sort: { gospelcommunityID: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority";
      const aggregateResult = await gospelcommunities.aggregate(pipeline, { readConcern });
      return await aggregateResult.toArray();

    } catch (e) {
      console.error(`Unable to retrieve gospelcommunities: ${e}`);
      return { error: e };
    }
  }

  //retrieve an gospelcommunity using the transaction Id
  static async getgospelcommunityById(Id) {
    try {
      const pipeline = [
        {
          $match: { gospelcommunityID: Id }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //gospelcommunities.readConcern
      const aggregateResult = await gospelcommunities.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve gospelcommunity: ${e}`);
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
    const { poolSize, wtimeout } = gospelcommunities.s.db.serverConfig.s.options
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
    const sortStage = { $sort: { "gospelcommunityID": -1 } }
    const countingPipeline = [matchStage, sortStage, { $count: "count" }]
    const skipStage = { $skip: moviesPerPage * page }
    const limitStage = { $limit: moviesPerPage }
    const facetStage = {
      $facet: {
        customer: [
          {
            $bucket: {
              groupBy: "$gospelcommunityID",
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
      const results = await (await gospelcommunities.aggregate(queryPipeline)).next()
      const count = await (await gospelcommunities.aggregate(countingPipeline)).next()
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