import mongoose, { Schema, models, Types } from 'mongoose';

/**
 * Ветка работы внутри проекта (Project Thread / Branch).
 *
 * Зачем отдельная модель, а не поле в Dialog:
 *   • Dialog имеет TTL `expireAfterSeconds: 604800` — обычные чаты
 *     удаляются через неделю простоя. Для долгих проектов это плохо.
 *   • ProjectThread живёт без TTL и хранит «именованную» ветку
 *     (План / Исследование / Риски / Финансы / …).
 *   • На MVP сообщения по веткам не привязаны жёстко к этой модели:
 *     thread живёт как метка / точка входа. В будущем сюда можно
 *     прикрутить dialogId и роутить сообщения по треду.
 */
export interface IProjectThread {
  project: Types.ObjectId;
  user: Types.ObjectId;
  userEmail: string;
  title: string;
  // Опциональная связь с Dialog — заполняется когда в треде есть переписка.
  dialog?: Types.ObjectId;
  // Тип: общий чат / план / исследование / риски / финансы / документы / …
  kind?: string;
  // Свободное короткое описание для UI.
  hint?: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectThreadSchema = new Schema<IProjectThread>(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userEmail: { type: String, required: true, index: true },
    title: { type: String, required: true },
    dialog: { type: mongoose.Schema.Types.ObjectId, ref: 'Dialog' },
    kind: { type: String },
    hint: { type: String },
  },
  { timestamps: true },
);

projectThreadSchema.index({ project: 1, createdAt: -1 });
projectThreadSchema.index({ user: 1, project: 1 });

const ProjectThread =
  models.ProjectThread ||
  mongoose.model('ProjectThread', projectThreadSchema);
export default ProjectThread;
