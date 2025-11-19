import ShortQuestion from "../models/ShortQuestion.model";

export const createShortQuestion = async (req, res) => {
  try {
    const question = await ShortQuestion.create(req.body);
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getShortQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", entity_type, entity_id } = req.query;

    const filter: any = {};
    if (entity_type) filter.entity_type = entity_type;
    if (entity_id) filter.entity_id = entity_id;

    if (search) filter.question = { $regex: search, $options: "i" };

    const data = await ShortQuestion.find(filter)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    const total = await ShortQuestion.countDocuments(filter);

    res.json({
      items: data,
      pagination: {
        total,
        page: +page,
        limit: +limit,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getShortQuestion = async (req, res) => {
  try {
    const q = await ShortQuestion.findById(req.params.id);
    if (!q) return res.status(404).json({ error: "Not found" });
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateShortQuestion = async (req, res) => {
  try {
    const updated = await ShortQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteShortQuestion = async (req, res) => {
  try {
    await ShortQuestion.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getPaginatedShortQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", entity_type, entity_id, language_id } = req.query;

    const filter: any = {};

    if (entity_type) filter.entity_type = entity_type;
    if (entity_id) filter.entity_id = entity_id;

    if (search) filter.question = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);

    const data = await ShortQuestion.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ShortQuestion.countDocuments(filter);

    res.json({
      data,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    console.error("❌ Pagination error:", err);
    res.status(500).json({ error: err.message });
  }
};
export const bulkCreateShortQuestions = async (req, res) => {
  try {
    console.log("💾 Incoming Bulk:", JSON.stringify(req.body, null, 2));

    const shortQuestions = req.body.shortQuestions || req.body.questions || req.body.mcqs;

    if (!Array.isArray(shortQuestions)) {
      return res.status(400).json({
        error: "shortQuestions must be an array",
      });
    }

    // Validate each entry
    const sanitized = shortQuestions.map(q => ({
      entity_type: q.entity_type,
      entity_id: q.entity_id,
      question: q.question,
      answer: q.answer || q.correct_answer || "",
      explanation: q.explanation || "",
      difficulty: q.difficulty || "medium",
      tags: q.tags || [],
      is_active: q.is_active ?? true,
      content: q.content || "",
      supported_language_ids: q.supported_language_ids || []
    }));

    const created = await ShortQuestion.insertMany(sanitized);

    res.status(201).json({
      message: "Bulk short questions created successfully",
      count: created.length,
      items: created,
    });

  } catch (err) {
    console.error("Bulk Short Question Error:", err);
    res.status(400).json({ error: err.message });
  }
};
