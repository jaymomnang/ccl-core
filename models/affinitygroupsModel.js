/*global process*/
import globalHelper from "../misc/globalHelper.js";

let affinitygroups;
let _ns;

export default class affinitygroupModel {
  static async injectDB(conn) {
    if (affinitygroups) {
      return;
    }
    try {
      _ns = await conn.db(process.env.NS);
      // eslint-disable-next-line require-atomic-updates
      affinitygroups = await conn.db(process.env.NS).collection("affinitygroups");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in affinitygroupModel: ${e}`
      );
    }
  }

  /**
   * Inserts an affinitygroup into the `affinitygroups` collection, with the following fields:

   * @param {string} affinitygroupID - The _id of the affinitygroup in the `affinitygroups` collection.
   * @param {Object} user - An object containing the user's name and email.
   * @param {Number} membersCount - The total count of members in the affinitygroup.
   * @param {string} groupName - The affinitygroup name.
   * @param {string} meetingLocation - The meeting location of the affinitygroup.
   * @param {string} meetingDate - The meeting date of the affinitygroup.
   * @param {string} meetingTime - The meeting time of the affinitygroup.
   * @param {string} cordinator - The group cordinator.
   * @param {Object} members - Details of members in the affinitygroup.
   * @param {string} asstCordinator - The assistant group cordinator.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addaffinitygroup(
    affinitygroupID,
    user,
    membersCount,
    groupName,
    meetingLocation,
    meetingDate,
    meetingTime,
    cordinator,
    asstCordinator,
    members
  ) {
    try {
      // TODO: Create/Update affinitygroups
      // Construct the affinitygroup document to be inserted.
      let date_upd = globalHelper.currentDateTime();

      const affinitygroupDoc = {
        affinitygroupID: affinitygroupID,
        membersCount: membersCount,
        groupNmeetingLocationame: groupName,
        meetingLocation: meetingLocation,
        meetingDate: meetingDate,
        meetingTime: meetingTime,
        cordinator: cordinator,
        members: members,
        asstCordinator: asstCordinator,
        dateCreated: date_upd,
        createdBy: user,
        dateUpdated: date_upd,
        updateBy: user,
        status: "ACTIVE"
      };

      return await affinitygroups.insertOne(affinitygroupDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post affinitygroup: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the affinitygroup in the affinitygroup collection.
   * @param {string} affinitygroupID - The _id of the affinitygroup in the `affinitygroups` collection.
   * @param {Object} user - An object containing the user's name and email.
   * @param {Number} membersCount - The total count of members in the affinitygroup.
   * @param {string} groupName - The affinitygroup name.
   * @param {string} meetingLocation - The meeting location of the affinitygroup.
   * @param {string} meetingDate - The meeting date of the affinitygroup.
   * @param {string} meetingTime - The meeting time of the affinitygroup.
   * @param {string} cordinator - The group cordinator.
   * @param {Object} members - Details of members in the affinitygroup.
   * @param {string} asstCordinator - The assistant group cordinator.   
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updateaffinitygroup(
    affinitygroupID,
    user,
    membersCount,
    groupName,
    meetingLocation,
    meetingDate,
    meetingTime,
    cordinator,
    asstCordinator,
    members
  ) {
    try {
      // TODO: Create/Update affinitygroups
      // Use the affinitygroupId and status to select the proper affinitygroup, then update.

      let date_upd = globalHelper.currentDateTime();

      const updateResponse = await affinitygroups.updateOne(
        { affinitygroupID: affinitygroupID, status: "ACTIVE" },
        {
          $set: {
            membersCount: membersCount,
            groupNmeetingLocationame: groupName,
            meetingLocation: meetingLocation,
            meetingDate: meetingDate,
            meetingTime: meetingTime,
            cordinator: cordinator,
            members: members,
            asstCordinator: asstCordinator,
            dateUpdated: date_upd,
            updateBy: user
          }
        }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update affinitygroup: ${e}`);
      return { error: e };
    }
  }

  //void a specific affinitygroup
  static async deleteaffinitygroup(affinitygroupID) {
    /**
    Ticket: void affinitygroup. Only open affinitygroups can be voided.
    */

    try {
      // TODO Ticket: void affinitygroup
      const deleteResponse = await affinitygroups.updateOne(
        { affinitygroupID: affinitygroupID, status: "ACTIVE" },
        { $set: { status: "INACTIVE" } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to void affinitygroup: ${e}`);
      return { error: e };
    }
  }


  //retrieve all affinitygroups
  static async getAllaffinitygroups() {
    /**
    Todo: retrieve all affinitygroups from the database using slow loading.
    */
    try {
      const pipeline = [
        {
          $sort: { affinitygroupID: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority";
      const aggregateResult = await affinitygroups.aggregate(pipeline, { readConcern });
      return await aggregateResult.toArray();

    } catch (e) {
      console.error(`Unable to retrieve affinitygroups: ${e}`);
      return { error: e };
    }
  }

  //retrieve an affinitygroup using the transaction Id
  static async getaffinitygroupById(Id) {
    try {
      const pipeline = [
        {
          $match: { affinitygroupID: Id }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //affinitygroups.readConcern
      const aggregateResult = await affinitygroups.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve affinitygroup: ${e}`);
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
    const { poolSize, wtimeout } = affinitygroups.s.db.serverConfig.s.options
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
    const sortStage = { $sort: { "affinitygroupID": -1 } }
    const countingPipeline = [matchStage, sortStage, { $count: "count" }]
    const skipStage = { $skip: moviesPerPage * page }
    const limitStage = { $limit: moviesPerPage }
    const facetStage = {
      $facet: {
        customer: [
          {
            $bucket: {
              groupBy: "$affinitygroupID",
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
      const results = await (await affinitygroups.aggregate(queryPipeline)).next()
      const count = await (await affinitygroups.aggregate(countingPipeline)).next()
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