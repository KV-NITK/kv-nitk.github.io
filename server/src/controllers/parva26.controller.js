import { getFlowers, addFlowers } from "../services/parva26/flowers.service.js";
import { startPlay, getPlay, guess, hint, setName, getChart, FilmError } from "../services/parva26/film.service.js";
import { createAllowance } from "../middleware/rateLimit.middleware.js";
import { flowersSchema, playIdSchema, guessSchema, nameSchema } from "../validators/parva26.validator.js";

// Each visitor may throw as many flowers a minute as the page allows (150);
// each address a good many more, since a hostel shares one.
const flowersPerClient = createAllowance({ limit: 150, windowMs: 60_000 });
const flowersPerAddress = createAllowance({ limit: 3000, windowMs: 60_000 });

const fail = (res, error, fallback) => {
  if (error instanceof FilmError) {
    return res.status(error.statusCode).json({ success: false, code: error.code, message: error.message });
  }
  console.error(`${fallback}:`, error);
  return res.status(500).json({ success: false, message: fallback });
};

const invalid = (res, parsed, message) =>
  res.status(400).json({ success: false, message, errors: parsed.error.flatten() });

// GET /api/parva26/flowers
export const getFlowersController = async (req, res) => {
  try {
    return res.json({ success: true, total: await getFlowers() });
  } catch (error) {
    return fail(res, error, "Could not read the flower count");
  }
};

// POST /api/parva26/flowers { count, client }
export const addFlowersController = async (req, res) => {
  const parsed = flowersSchema.safeParse(req.body);
  if (!parsed.success) return invalid(res, parsed, "Invalid flowers");

  try {
    const { count, client } = parsed.data;
    const accepted = flowersPerAddress.take(req.ip, flowersPerClient.take(client, count));
    const total = accepted ? await addFlowers(accepted) : await getFlowers();
    return res.json({ success: true, accepted, total });
  } catch (error) {
    return fail(res, error, "Could not count the flowers");
  }
};

// POST /api/parva26/film/plays
export const startPlayController = async (req, res) => {
  try {
    return res.status(201).json({ success: true, play: await startPlay() });
  } catch (error) {
    return fail(res, error, "Could not start the game");
  }
};

const withPlayId = (handler) => async (req, res) => {
  const parsed = playIdSchema.safeParse(req.params.playId);
  if (!parsed.success) return res.status(404).json({ success: false, code: "PLAY_ENDED", message: "This game has ended." });
  return handler(req, res, parsed.data);
};

// GET /api/parva26/film/plays/:playId
export const getPlayController = withPlayId(async (req, res, playId) => {
  try {
    return res.json({ success: true, play: await getPlay(playId) });
  } catch (error) {
    return fail(res, error, "Could not load the game");
  }
});

// POST /api/parva26/film/plays/:playId/guess { guess }
export const guessController = withPlayId(async (req, res, playId) => {
  const parsed = guessSchema.safeParse(req.body);
  if (!parsed.success) return invalid(res, parsed, "Write a film name");

  try {
    return res.json({ success: true, ...(await guess(playId, parsed.data.guess)) });
  } catch (error) {
    return fail(res, error, "Could not check the answer");
  }
});

// POST /api/parva26/film/plays/:playId/hint
export const hintController = withPlayId(async (req, res, playId) => {
  try {
    return res.json({ success: true, play: await hint(playId) });
  } catch (error) {
    return fail(res, error, "Could not give a hint");
  }
});

// PUT /api/parva26/film/plays/:playId/name { name }
export const setNameController = withPlayId(async (req, res, playId) => {
  const parsed = nameSchema.safeParse(req.body);
  if (!parsed.success) return invalid(res, parsed, "Invalid name");

  try {
    const name = await setName(playId, parsed.data.name);
    return res.json({ success: true, name, chart: await getChart(playId) });
  } catch (error) {
    return fail(res, error, "Could not save the name");
  }
});

// GET /api/parva26/film/chart?play=<playId>
export const chartController = async (req, res) => {
  const parsed = playIdSchema.safeParse(req.query.play);

  try {
    return res.json({ success: true, chart: await getChart(parsed.success ? parsed.data : null) });
  } catch (error) {
    return fail(res, error, "Could not load the chart");
  }
};
