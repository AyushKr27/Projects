import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, createTask, updateTask, deleteTask } from "../features/tasks/taskSlice";
import { useForm } from "react-hook-form";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import toast, { Toaster } from "react-hot-toast";

export default function Tasks() {
  const dispatch = useDispatch();
  const tasksFromStore = useSelector((s) => s.tasks.items || []);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { title: "", description: "", status: "pending" },
  });

  useEffect(() => {
    setLoading(true);
    dispatch(fetchTasks())
      .unwrap()
      .catch(() => toast.error("Failed to load tasks"))
      .finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    const arranged = [...tasksFromStore].sort((a, b) => {
      if (a.order !== undefined || b.order !== undefined) {
        return (a.order ?? 0) - (b.order ?? 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    setTasks(arranged);
  }, [tasksFromStore]);

  const visible = useMemo(() => {
    let list = tasks;

    if (filterStatus !== "all") {
      list = list.filter((t) => t.status === filterStatus);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((t) =>
        `${t.title} ${t.description || ""}`.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      if (sortBy === "title") {
        return sortDir === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else {
        return sortDir === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return list;
  }, [tasks, query, filterStatus, sortBy, sortDir]);

  const onCreate = async (data) => {
    try {
      setSubmitting(true);
      await dispatch(createTask(data)).unwrap();
      toast.success("Task created");
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setValue("title", task.title);
    setValue("description", task.description || "");
    setValue("status", task.status || "pending");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onUpdate = async (data) => {
    if (!editingTask) return;
    try {
      setSubmitting(true);
      await dispatch(updateTask({ id: editingTask._id, data })).unwrap();
      toast.success("Task updated");
      setEditingTask(null);
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  const onCancelEdit = () => {
    setEditingTask(null);
    reset();
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await dispatch(deleteTask(id)).unwrap();
      toast.success("Task deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const src = result.source.index;
    const dest = result.destination.index;
    if (src === dest) return;

    const reordered = Array.from(tasks);
    const [moved] = reordered.splice(src, 1);
    reordered.splice(dest, 0, moved);

    setTasks(reordered);

    try {
      const updates = reordered.map((t, idx) => ({ id: t._id, order: idx }));
      await Promise.all(
        updates.map((u) =>
          dispatch(updateTask({ id: u.id, data: { order: u.order } }))
            .unwrap()
            .catch(() => {})
        )
      );
      toast.success("Order updated");
    } catch (err) {
      console.error(err);
      toast.error("Could not persist order (backend may not support it)");
    }
  };

  const fmt = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen py-8 relative bg-gray-50 dark:bg-slate-900">
      <Toaster position="top-right" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-300 to-purple-300 opacity-8 dark:opacity-6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Tasks</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Search, reorder, and manage your tasks</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or description..."
              aria-label="Search tasks"
              className="px-3 py-2 rounded-lg border bg-white/60 dark:bg-slate-700/60 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 outline-none w-full sm:w-64 focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by status"
              className="px-3 py-2 rounded-lg border bg-white/60 dark:bg-slate-700/60 text-gray-800 dark:text-gray-100 outline-none"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort by"
              className="px-3 py-2 rounded-lg border bg-white/60 dark:bg-slate-700/60 text-gray-800 dark:text-gray-100 outline-none"
            >
              <option value="createdAt">Sort: Newest</option>
              <option value="title">Sort: Title</option>
            </select>

            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="px-3 py-2 rounded-lg border bg-white/60 dark:bg-slate-700/60 text-gray-800 dark:text-gray-100"
              title="Toggle sort direction"
            >
              {sortDir === "asc" ? "Asc" : "Desc"}
            </button>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700 rounded-xl p-4 mb-6">
          <form onSubmit={handleSubmit(onCreate)} className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Create task form">
            <input
              {...register("title")}
              placeholder="Title"
              aria-label="Task title"
              className="col-span-1 sm:col-span-1 px-3 py-2 rounded-lg border bg-white/60 dark:bg-slate-700/60 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500"
              required
            />
            <input
              {...register("description")}
              placeholder="Description"
              aria-label="Task description"
              className="col-span-1 sm:col-span-1 px-3 py-2 rounded-lg border bg-white/60 dark:bg-slate-700/60 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500"
            />
            <div className="flex gap-2 items-center">
              <select {...register("status")} aria-label="Task status" className="px-3 py-2 rounded-lg border bg-white/60 dark:bg-slate-700/60 text-gray-800 dark:text-gray-100">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <button
                type="submit"
                disabled={submitting}
                className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-60 focus:ring-2 focus:ring-indigo-300"
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks-droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">Loading tasks...</div>
                ) : visible.length === 0 ? (
                  <div className="bg-white/80 dark:bg-slate-800/70 border border-white/30 dark:border-slate-700 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
                    No tasks found — create your first task above.
                  </div>
                ) : (
                  visible.map((task, index) => (
                    <Draggable draggableId={String(task._id)} index={index} key={task._id}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className={`bg-white/90 dark:bg-slate-800/70 border border-white/30 dark:border-slate-700 rounded-xl p-4 shadow flex items-start justify-between transition-transform ${
                            snapshot.isDragging ? "scale-105 ring-2 ring-indigo-200 dark:ring-indigo-500" : ""
                          }`}
                        >
                          <div className="w-0 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{task.title}</h3>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  task.status === "completed"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300"
                                }`}
                              >
                                {task.status}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">Created: {fmt(task.createdAt)}</div>
                          </div>

                          <div className="flex flex-col gap-2 items-end ml-4">
                            <button
                              onClick={() => openEdit(task)}
                              className="text-sm px-3 py-1 border rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => onDelete(task._id)}
                              className="text-sm px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onCancelEdit} />

          <div className="relative z-10 w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
            <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-100">Edit Task</h3>

            <form onSubmit={handleSubmit(onUpdate)} className="space-y-3" aria-label="Edit task form">
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-200 block mb-1">Title</label>
                <input
                  {...register("title")}
                  className="w-full px-3 py-2 rounded-lg border bg-white/60 dark:bg-slate-700/60 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 dark:text-gray-200 block mb-1">Description</label>
                <input
                  {...register("description")}
                  className="w-full px-3 py-2 rounded-lg border bg-white/60 dark:bg-slate-700/60 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 dark:text-gray-200 block mb-1">Status</label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 rounded-lg border bg-white/60 dark:bg-slate-700/60 text-gray-800 dark:text-gray-100"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancelEdit} className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-200">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-60">
                  {submitting ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "";
  }
}
