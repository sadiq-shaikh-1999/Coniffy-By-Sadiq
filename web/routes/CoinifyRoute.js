import { Router} from "express";
import { create } from "../controller/CoinifyController.js";

const CoinifyRoute = Router();

CoinifyRoute.post("/create", create);
 
export default CoinifyRoute;