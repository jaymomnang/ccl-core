import users from "../models/usersModel.js"
const _PAGE = 20;

export default class usersController {
  static async getusers(req, res) {
    
    let totalNumItems 
    const usersList = await users.getAllusers()
    totalNumItems = usersList.length

    let response = {
      users: usersList,
      page: 0,
      filters: {},
      items_per_page: _PAGE,
      total_items: totalNumItems,
    }
    res.json(response)
  }

  static async getuserById(req, res) {
    try {
      let email = req.params.email || {}
      let user = await users.getuserById(email)
      if (!user) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = user.lastupdated instanceof Date ? "Date" : "other"
      res.json({ user, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  static async getuser(req, res) {
    try {
      let email = req.params.email || {}
      let token = req.params.token || {}

      let user = await users.getUser(email, token)
      if (!user) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = user.lastupdated instanceof Date ? "Date" : "other"
      res.json({ user, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }


  static async searchusers(req, res) {
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
      case "Email":
        filters.email = req.query.email
        break
      case "firstname":
        filters.firstname = req.query.firstname
        break
      case "lastname":
        filters.lastname = req.query.lastname
        break
      case "status":
        filters.status = req.query.status
        break
      default:
      // nothing to do
    }

    const { usersList, totalNumItems } = await users.getAllusers({
      filters,
      page,
      _PAGE,
    })

    let response = {
      users: usersList,
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
      return this.searchusers(req, res, next)
    }

    const filters = { cast: req.query.cast }

    const facetedSearchResult = await users.facetedSearch({
      filters,
      page,
      _PAGE,
    })

    let response = {
      users: facetedSearchResult.users,
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
    const { poolSize, wtimeout, authInfo } = await users.getConfiguration()
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
