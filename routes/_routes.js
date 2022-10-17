import { Router } from "express"
import appSettingsCTRL from "../controllers/AppSettingController.js"
import usersCTRL from "../controllers/userController.js"
import coursesCTRL from "../controllers/coursesController.js"

const router = new Router()

//default route
router.route("/").get(appSettingsCTRL.getAppSettings)

// routes for app settings
router.route("/settings/").get(appSettingsCTRL.getAppSettings)
router.route("/settings/search").get(appSettingsCTRL.searchAppSettings)
router.route("/settings/facet-search").get(appSettingsCTRL.facetedSearch)
router.route("/settings/id/:id").get(appSettingsCTRL.getAppSettingById)
router.route("/settings/config-options").get(appSettingsCTRL.getConfig)

// routes for app users
router.route("/people/").get(usersCTRL.getusers)
router.route("/people/search").get(usersCTRL.searchusers)
router.route("/people/facet-search").get(usersCTRL.facetedSearch)
router.route("/people/getuser/:email").get(usersCTRL.getuserById)
router.route("/people/auth/:email/:token").get(usersCTRL.getuser)
router.route("/people/config-options").get(usersCTRL.getConfig)

// routes for courses
router.route("/inv/").get(coursesCTRL.getcourses)
router.route("/inv/search").get(coursesCTRL.searchcourses)
router.route("/inv/facet-search").get(coursesCTRL.facetedSearch)
router.route("/inv/id/:id").get(coursesCTRL.getcourseById)
router.route("/inv/config-options").get(coursesCTRL.getConfig)

export default router
