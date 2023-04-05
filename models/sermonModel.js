/*global process*/
import globalHelper from "../misc/globalHelper.js";

let sermon;
let _ns;

export default class sermonModel {
  static async injectDB(conn) {
    if (sermon) {
      return;
    }
    try {
      _ns = await conn.db(process.env.NS);
      // eslint-disable-next-line require-atomic-updates
      sermon = await conn.db(process.env.NS).collection("sermon");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in sermonModel: ${e}`
      );
    }
  }

  /**
   * Inserts an sermon into the `sermon` collection, with the following fields:

   * @param {string} sermonID - The _id of the sermon in the `sermon` collection.
   * @param {string} title - The title of the sermon.
   * @param {string} preacher - The preacher/teacher.
   * @param {string} series - The series to which the sermon is a part of.
   * @param {Number} serialNo - The serial number of the sermon within the series.
   * @param {string} date - The date on which the sermon was posted.
   * @param {string} texts - Bible texts/references.
   * @param {string} YouTubeURL - Youtube URL of the sermon.
   * @param {string} SoundCloudURL - SoundCloud URL of the sermon.
   * @param {string} ApplePodcastURL - ApplePodcast URL of the sermon.
   * @param {string} SpotifyURL - Spotify URL of the sermon.
   * @param {Object} user - The user that last updated the sermon.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addsermon(
    sermonID,
    title,
    preacher,
    series,
    serialNo,
    date,
    texts,
    YouTubeURL,
    SoundCloudURL,
    ApplePodcastURL,
    SpotifyURL,
    user
  ) {
    try {
      // TODO: Create/Update sermon
      // Construct the sermon document to be inserted.
      let date_upd = globalHelper.currentDateTime();

      const sermonDoc = {
        sermonID: sermonID,
        title: title,
        preacher: preacher,
        series: series,
        serialNo: serialNo,
        date: date,
        texts: texts,
        YouTubeURL: YouTubeURL,
        SoundCloudURL: SoundCloudURL,
        ApplePodcastURL: ApplePodcastURL,
        SpotifyURL: SpotifyURL,
        dateCreated: date_upd,
        createdBy: user,
        dateUpdated: date_upd,
        updateBy: user,
        status: "ACTIVE"
      };

      return await sermon.insertOne(sermonDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post sermon: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the sermon in the sermon collection.
   * @param {string} sermonID - The _id of the sermon in the `sermon` collection.
   * @param {string} title - The title of the sermon.
   * @param {string} preacher - The preacher/teacher.
   * @param {string} series - The series to which the sermon is a part of.
   * @param {Number} serialNo - The serial number of the sermon within the series.
   * @param {string} date - The date on which the sermon was posted.
   * @param {string} texts - Bible texts/references.
   * @param {string} YouTubeURL - Youtube URL of the sermon.
   * @param {string} SoundCloudURL - SoundCloud URL of the sermon.
   * @param {string} ApplePodcastURL - ApplePodcast URL of the sermon.
   * @param {string} SpotifyURL - Spotify URL of the sermon.
   * @param {Object} user - The user that last updated the sermon.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updatesermon(
    sermonID,
    title,
    preacher,
    series,
    serialNo,
    date,
    texts,
    YouTubeURL,
    SoundCloudURL,
    ApplePodcastURL,
    SpotifyURL,
    user
  ) {
    try {
      // TODO: Create/Update sermon
      // Use the sermonId and status to select the proper sermon, then update.

      let date_upd = globalHelper.currentDateTime();

      const updateResponse = await sermon.updateOne(
        { sermonID: sermonID, status: "ACTIVE" },
        {
          $set: {            
            title: title,
            preacher: preacher,
            series: series,
            serialNo: serialNo,
            date: date,
            texts: texts,
            YouTubeURL: YouTubeURL,
            SoundCloudURL: SoundCloudURL,
            ApplePodcastURL: ApplePodcastURL,
            SpotifyURL: SpotifyURL,            
            dateUpdated: date_upd,
            updateBy: user
          }
        }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update sermon: ${e}`);
      return { error: e };
    }
  }

  //void a specific sermon
  static async deletesermon(sermonID) {
    /**
    Ticket: void sermon. Only open sermon can be voided.
    */

    try {
      // TODO Ticket: void sermon
      const deleteResponse = await sermon.updateOne(
        { sermonID: sermonID, status: "ACTIVE" },
        { $set: { status: "INACTIVE" } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to deactivate sermon: ${e}`);
      return { error: e };
    }
  }


  //retrieve all sermon
  static async getAllsermon() {
    /**
    Todo: retrieve all sermon from the database using slow loading.
    */
    try {
      const pipeline = [
        {
          $sort: { sermonID: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority";
      const aggregateResult = await sermon.aggregate(pipeline, { readConcern });
      return await aggregateResult.toArray();

    } catch (e) {
      console.error(`Unable to retrieve sermon: ${e}`);
      return { error: e };
    }
  }

  //retrieve an sermon using the transaction Id
  static async getsermonById(Id) {
    try {
      const pipeline = [
        {
          $match: { sermonID: Id }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //sermon.readConcern
      const aggregateResult = await sermon.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve sermon: ${e}`);
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
    const { poolSize, wtimeout } = sermon.s.db.serverConfig.s.options
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
    const sortStage = { $sort: { "sermonID": -1 } }
    const countingPipeline = [matchStage, sortStage, { $count: "count" }]
    const skipStage = { $skip: moviesPerPage * page }
    const limitStage = { $limit: moviesPerPage }
    const facetStage = {
      $facet: {
        customer: [
          {
            $bucket: {
              groupBy: "$series",
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
      const results = await (await sermon.aggregate(queryPipeline)).next()
      const count = await (await sermon.aggregate(countingPipeline)).next()
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