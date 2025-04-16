import { createApp } from "./app.js";

import {MovieModel} from "./model/sql/movie.js";

createApp({movieModel : MovieModel})