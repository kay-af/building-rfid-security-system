import { Router } from 'express'
import VisitorController from '../controllers/visitor_controller'

const router = Router()

router.get('/add', VisitorController.serveVisitorAddPage)
router.get('/remove', VisitorController.serveVisitorRemovePage)
router.post('/add', VisitorController.addVisitor)
router.post('/remove', VisitorController.removeVisitor)

export default router