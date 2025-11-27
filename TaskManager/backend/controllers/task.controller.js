import Task from "../models/Task.js";

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("getTasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });

    const maxTask = await Task.findOne({ userId: req.user.id }).sort({ order: -1 }).select("order");
    const nextOrder = (maxTask && typeof maxTask.order === "number") ? (maxTask.order + 1) : 0;

    const task = await Task.create({
      title,
      description: description || "",
      status: status || "pending",
      userId: req.user.id,
      order: nextOrder,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("createTask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Task.findById(id);
    if (!existing || existing.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Not found" });
    }

    const allowed = ["title", "description", "status", "order"];
    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No updatable fields provided" });
    }

    const updated = await Task.findByIdAndUpdate(id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("updateTask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Task.findById(id);
    if (!existing || existing.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Not found" });
    }

    await Task.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteTask error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const reorderTasks = async (req, res) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ message: "orders array required" });
    }

    for (const item of orders) {
      if (!item || !item.id || typeof item.order !== "number") {
        return res.status(400).json({ message: "Each order must be { id, order }" });
      }
    }

    const ids = orders.map((o) => o.id);
    const tasks = await Task.find({ _id: { $in: ids } });

    for (const t of tasks) {
      if (t.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to reorder these tasks" });
      }
    }

    await Promise.all(
      orders.map((o) =>
        Task.findByIdAndUpdate(o.id, { order: o.order }, { new: false }).exec()
      )
    );

    const refreshed = await Task.find({ userId: req.user.id }).sort({ order: 1, createdAt: -1 });
    res.json({ ok: true, tasks: refreshed });
  } catch (err) {
    console.error("reorderTasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
