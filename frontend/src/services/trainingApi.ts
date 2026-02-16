import request from '../utils/request';

const api = request;

export const trainingDatasetAPI = {
  getAllDatasets: async () => {
    const response = await api.get('/datasets');
    return response;
  },

  getDatasetById: async (id: number) => {
    const response = await api.get(`/datasets/${id}`);
    return response;
  },

  createDataset: async (name: string, description: string, files: File[], uploadedBy: number) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('uploadedBy', uploadedBy.toString());
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post('/datasets', formData);
    return response;
  },

  updateDataset: async (id: number, name: string, description: string) => {
    const response = await api.put(`/datasets/${id}`, null, {
      params: { name, description },
    });
    return response;
  },

  deleteDataset: async (id: number) => {
    const response = await api.delete(`/datasets/${id}`);
    return response;
  },

  getDatasetsByUploadedBy: async (uploadedBy: number) => {
    const response = await api.get(`/datasets/user/${uploadedBy}`);
    return response;
  },

  getAvailableDatasets: async () => {
    const response = await api.get('/datasets/available');
    return response;
  },

  addFilesToDataset: async (id: number, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post(`/datasets/${id}/add-files`, formData);
    return response;
  },

  getDatasetFiles: async (id: number) => {
    const response = await api.get(`/datasets/${id}/files`);
    return response;
  },

  removeFilesFromDataset: async (id: number, fileNames: string[]) => {
    const formData = new FormData();
    fileNames.forEach(fileName => {
      formData.append('fileNames', fileName);
    });

    const response = await api.delete(`/datasets/${id}/remove-files`, {
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};

export const trainingTaskAPI = {
  getAllTasks: async () => {
    const response = await api.get('/training-tasks');
    return response;
  },

  getTaskById: async (id: number) => {
    const response = await api.get(`/training-tasks/${id}`);
    return response;
  },

  createTask: async (name: string, description: string, modelType: string, trainedBy: number, datasetId?: number, regressionHead?: string) => {
    const response = await api.post('/training-tasks', { name, description, modelType, trainedBy, datasetId, regressionHead });
    return response;
  },

  updateTask: async (id: number, name: string, description: string) => {
    const response = await api.put(`/training-tasks/${id}`, { name, description });
    return response;
  },

  deleteTask: async (id: number) => {
    const response = await api.delete(`/training-tasks/${id}`);
    return response;
  },

  getTasksByTrainedBy: async (trainedBy: number) => {
    const response = await api.get(`/training-tasks/user/${trainedBy}`);
    return response;
  },

  getTasksByStatus: async (status: string) => {
    const response = await api.get(`/training-tasks/status/${status}`);
    return response;
  },

  getTasksByModelType: async (modelType: string) => {
    const response = await api.get(`/training-tasks/type/${modelType}`);
    return response;
  },

  startTraining: async (id: number) => {
    const response = await api.post(`/training-tasks/${id}/start`);
    return response;
  },

  updateTaskProgress: async (id: number, progress: number) => {
    const response = await api.put(`/training-tasks/${id}/progress`, { progress });
    return response;
  },

  completeTask: async (id: number, accuracy: number, modelPath: string) => {
    const response = await api.post(`/training-tasks/${id}/complete`, { accuracy, modelPath });
    return response;
  },

  failTask: async (id: number, errorMessage: string) => {
    const response = await api.post(`/training-tasks/${id}/fail`, { errorMessage });
    return response;
  },

  rateImage: async (taskId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/training-tasks/${taskId}/rate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};

export const aiModelAPI = {
  getAllModels: async () => {
    const response = await api.get('/models');
    return response;
  },

  getModelById: async (id: number) => {
    const response = await api.get(`/models/${id}`);
    return response;
  },

  createModel: async (name: string, type: string, description: string, version: string, createdBy: number, trainingTaskId?: number, modelPath?: string, trainingDataSize?: string, accuracy?: number) => {
    const response = await api.post('/models', { name, type, description, version, createdBy, trainingTaskId, modelPath, trainingDataSize, accuracy });
    return response;
  },

  updateModel: async (id: number, name: string, description: string, status: string) => {
    const response = await api.put(`/models/${id}`, { name, description, status });
    return response;
  },

  deleteModel: async (id: number) => {
    const response = await api.delete(`/models/${id}`);
    return response;
  },

  getModelsByCreatedBy: async (createdBy: number) => {
    const response = await api.get(`/models/user/${createdBy}`);
    return response;
  },

  getModelsByStatus: async (status: string) => {
    const response = await api.get(`/models/status/${status}`);
    return response;
  },

  getModelsByType: async (type: string) => {
    const response = await api.get(`/models/type/${type}`);
    return response;
  },

  getProductionModels: async () => {
    const response = await api.get('/models/production');
    return response;
  },

  setProductionModel: async (id: number) => {
    const response = await api.post(`/models/${id}/set-production`);
    return response;
  },

  deactivateModel: async (id: number) => {
    const response = await api.post(`/models/${id}/deactivate`);
    return response;
  },
};

export default api;
