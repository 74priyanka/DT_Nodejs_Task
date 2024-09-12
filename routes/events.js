const express = require("express");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const connectDB = require("../db");
const eventDataModel = require("../Constants/eventDataModel");
const router = express.Router();
const upload = multer({ dest: "uploads/" });

//GET event by id
router.get("/events", async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: "Event ID is required" });
  }
  try {
    const db = await connectDB();
    const event = await db
      .collection("events")
      .findOne({ _id: new ObjectId(id) });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).send("Error fetching event");
  }
});

//GET latest events with pagination
router.get("/events/list", async (req, res) => {
  const { type, limit = 5, page = 1 } = req.query;

  if (type === "latest") {
    try {
      const db = await connectDB();

      const events = await db
        .collection("events")
        .find()
        .sort({ schedule: -1 }) // Sort by latest
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .toArray();

      res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching latest events:", error);
      res.status(500).json({ message: "Error fetching events" });
    }
  } else {
    res.status(400).json({ message: "Invalid event type" });
  }
});

//POST new event
router.post("/events", upload.single("image"), async (req, res) => {
  const {
    name,
    tagline,
    schedule,
    description,
    moderator,
    category,
    sub_category,
    rigor_rank,
  } = req.body;

  const image = req.file ? req.file.filename : "";

  const newEvent = {
    ...eventDataModel,
    uid: 18,
    name,
    tagline,
    schedule: new Date(schedule),
    description,
    files: { image },
    moderator,
    category,
    sub_category,
    rigor_rank: parseInt(rigor_rank),
    attendees: [],
  };

  try {
    const db = await connectDB();
    const result = await db.collection("events").insertOne(newEvent);
    res.status(201).json({ eventId: result.insertedId });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).send("Error creating event");
  }
});

//PUT update event by id

router.put("/events/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const {
    name,
    tagline,
    schedule,
    description,
    moderator,
    category,
    sub_category,
    rigor_rank,
  } = req.body;

  const image = req.file ? req.file.filename : null;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid event ID format" });
  }

  try {
    const db = await connectDB();
    const updateEvent = {
      $set: {
        ...(name && { name }),
        ...(tagline && { tagline }),
        ...(schedule && { schedule: new Date(schedule) }),
        ...(description && { description }),
        ...(moderator && { moderator }),
        ...(category && { category }),
        ...(sub_category && { sub_category }),
        ...(rigor_rank && { rigor_rank: parseInt(rigor_rank) }),
        ...(image && { files: { image } }),
      },
    };
    const result = await db
      .collection("events")
      .updateOne({ _id: new ObjectId(id) }, updateEvent);
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event updated successfully", result });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event", error });
  }
});

//DELETE event by id
router.delete("/events/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid event ID format" });
  }
  try {
    const db = await connectDB();
    const result = await db
      .collection("events")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event", error });
  }
});
module.exports = router;
