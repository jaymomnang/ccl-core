import courses from "../models/courseModel.js"

const _PAGE = 20;

export default class coursesController {
  static async getcourses(req, res) {

    let totalNumItems 
    const coursesList = await courses.getAllcourses()
    totalNumItems = coursesList.length

    let response = {
      courses: coursesList,
      page: 0,
      filters: {},
      items_per_page: _PAGE,
      total_items: totalNumItems,
    }
    res.json(response)
  }

  // static async getcoursesByCountry(req, res, next) {
  //   let countries = Array.isArray(req.query.countries)
  //     ? req.query.countries
  //     : Array(req.query.countries)
  //   let coursesList = await courses.getcoursesByCountry(countries)
  //   let response = {
  //     settings: coursesList,
  //   }
  //   res.json(response)
  // }

  static async getcourseById(req, res) {
    try {
      let id = req.params.id || {}
      let course = await courses.getcourseById(id)
      if (!course) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = course.lastupdated instanceof Date ? "Date" : "other"
      res.json({ course, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  static async searchcourses(req, res) {
    let page
    try {
      page = req.query.page ? parseInt(req.query.page, 10) : 0
    } catch (e) {
      console.error(`Got bad value for page:, ${e}`)
      page = 0
    }
    let searchType
    try {
      searchType = Object.keys(req.query)[0]
    } catch (e) {
      console.error(`No search keys specified: ${e}`)
    }

    let filters = {}

    switch (searchType) {
      case "ID":
        filters.ID = req.query.ID
        break
      case "description":
        filters.description = req.query.description
        break
      case "name":
        filters.name = req.query.name
        break
      default:
      // nothing to do
    }

    const { coursesList, totalNumItems } = await courses.getAllcourses({
      filters,
      page,
      _PAGE,
    })

    let response = {
      courses: coursesList,
      page: page,
      filters,
      items_per_page: _PAGE,
      total_results: totalNumItems,
    }

    res.json(response)
  }

  static async facetedSearch(req, res, next) {

    let page
    try {
      page = req.query.page ? parseInt(req.query.page, 10) : 0
    } catch (e) {
      console.error(`Got bad value for page, defaulting to 0: ${e}`)
      page = 0
    }

    if (!req.query.cast) {
      return this.searchcourses(req, res, next)
    }

    const filters = { cast: req.query.cast }

    const facetedSearchResult = await courses.facetedSearch({
      filters,
      page,
      _PAGE,
    })

    let response = {
      courses: facetedSearchResult.courses,
      facets: {
        runtime: facetedSearchResult.runtime,
        rating: facetedSearchResult.rating,
      },
      page: page,
      filters,
      items_per_page: _PAGE,
      total_results: facetedSearchResult.count,
    }

    res.json(response)
  }

  static async getConfig(req, res) {
    const { poolSize, wtimeout, authInfo } = await courses.getConfiguration()
    try {
      let response = {
        pool_size: poolSize,
        wtimeout,
        ...authInfo,
      }
      res.json(response)
    } catch (e) {
      res.status(500).json({ error: e })
    }
  }
}
