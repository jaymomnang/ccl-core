/*global process*/
import globalHelper from "../misc/globalHelper.js";

let courses;
let _ns;

export default class courseModel {
  static async injectDB(conn) {
    if (courses) {
      return;
    }
    try {
      _ns = await conn.db(process.env.NS);
      // eslint-disable-next-line require-atomic-updates
      courses = await conn.db(process.env.NS).collection("courses");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in courseModel: ${e}`
      );
    }
  }

  /**
   * Inserts an course into the `courses` collection, with the following fields:

   * @param {string} courseID - The _id of the course in the `courses` collection.
   * @param {string} title - The course title.
   * @param {Object} user - An object containing the user's name and email.
   * @param {Number} courseAmount - The total amount of the course.
   * @param {Number} VAT - The VAT/tax on the course.
   * @param {Number} discount - The discount amount on the course.
   * @param {string} date - The date on which the course was posted.
   * @param {string} orderNo - The purchase order number (if any) for which the course is issued.
   * @param {Object} courseDetails - Details of items, quantity and prices on the course.
   * @param {Object} customer - The customer to whom the course is issued.
   * @param {Object} shipTo - The shipping details.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addcourse(
    courseID,
    title,
    user,
    courseAmount,
    VAT,
    discount,
    date,
    orderNo,
    courseDetails,
    customer,
    shipTo
  ) {
    try {
      // TODO: Create/Update courses
      // Construct the course document to be inserted.
      let date_upd = globalHelper.currentDateTime();

      const courseDoc = {
        courseID: courseID,
        title: title,
        user: user,
        courseAmount: courseAmount,
        VAT: VAT,
        discount: discount,
        date: date,
        orderNo: orderNo,
        courseDetails: courseDetails,
        customer: customer,
        shipTo: shipTo,
        dateCreated: date_upd,
        createdBy: user,
        dateUpdated: date_upd,
        updateBy: user,
        status: "OPEN"
      };

      return await courses.insertOne(courseDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post course: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the course in the course collection.
   * @param {string} courseID - The _id of the course in the `courses` collection.
   * @param {string} title - The course title.
   * @param {Number} courseAmount - The total amount of the course.
   * @param {Number} VAT - The VAT/tax on the course.
   * @param {Number} discount - The discount amount on the course.
   * @param {string} date - The date on which the course was posted.
   * @param {string} orderNo - The purchase order number (if any) for which the course is issued.
   * @param {Object} courseDetails - Details of items, quantity and prices on the course.
   * @param {Object} customer - The customer to whom the course is issued.
   * @param {Object} shipTo - The shipping details.
   * @param {Object} user - The user that last updated the course.
   * @param {string} status - The status of the course: OPEN, CLOSED, VOID.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updatecourse(
    courseID,
    title,
    courseAmount,
    VAT,
    discount,
    date,
    orderNo,
    courseDetails,
    customer,
    shipTo,
    user
  ) {
    try {
      // TODO: Create/Update courses
      // Use the courseId and status to select the proper course, then update.

      let date_upd = globalHelper.currentDateTime();

      const updateResponse = await courses.updateOne(
        { courseID: courseID, status: "OPEN" },
        {
          $set: {
            courseAmount: courseAmount,
            title: title,
            VAT: VAT,
            discount: discount,
            date: date,
            orderNo: orderNo,
            courseDetails: courseDetails,
            customer: customer,
            shipTo: shipTo,
            dateUpdated: date_upd,
            updateBy: user,
            status: status
          }
        }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update course: ${e}`);
      return { error: e };
    }
  }

  //void a specific course
  static async deletecourse(courseID) {
    /**
    Ticket: void course. Only open courses can be voided.
    */

    try {
      // TODO Ticket: void course
      const deleteResponse = await courses.updateOne(
        { courseID: courseID, status: "OPEN" },
        { $set: { status: "VOID" } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to void course: ${e}`);
      return { error: e };
    }
  }


  //retrieve all courses
  static async getAllcourses() {
    /**
    Todo: retrieve all courses from the database using slow loading.
    */
    try {
      const pipeline = [
        {
          $sort: { courseID: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority";
      const aggregateResult = await courses.aggregate(pipeline, {readConcern});
      return await aggregateResult.toArray();

    } catch (e) {
      console.error(`Unable to retrieve courses: ${e}`);
      return { error: e };
    }
  }

  //retrieve an course using the transaction Id
  static async getcourseById(Id) {   
    try {
      const pipeline = [
        {
          $match: { courseID: Id }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //courses.readConcern
      const aggregateResult = await courses.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve course: ${e}`);
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
    const { poolSize, wtimeout } = courses.s.db.serverConfig.s.options
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
    const sortStage = { $sort: { "courseID": -1 } }
    const countingPipeline = [matchStage, sortStage, { $count: "count" }]
    const skipStage = { $skip: moviesPerPage * page }
    const limitStage = { $limit: moviesPerPage }
    const facetStage = {
      $facet: {        
        customer: [
          {
            $bucket: {
              groupBy: "$title",
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
      const results = await (await courses.aggregate(queryPipeline)).next()
      const count = await (await courses.aggregate(countingPipeline)).next()
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