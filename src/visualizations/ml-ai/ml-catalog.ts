import { createPlaceholderModule } from "@/visualizations/placeholder";

// Supervised Learning
export const linearRegressionModule = createPlaceholderModule(
  "linear-regression", "linear-regression", "Linear Regression",
  ["ml-ai", "supervised"], "beginner",
);
export const logisticRegressionModule = createPlaceholderModule(
  "logistic-regression", "logistic-regression", "Logistic Regression",
  ["ml-ai", "supervised"], "intermediate",
);
export const decisionTreeMlModule = createPlaceholderModule(
  "decision-tree-ml", "decision-tree-ml", "Decision Tree",
  ["ml-ai", "supervised"], "intermediate",
);
export const randomForestModule = createPlaceholderModule(
  "random-forest", "random-forest", "Random Forest",
  ["ml-ai", "supervised"], "intermediate",
);
export const svmModule = createPlaceholderModule(
  "svm", "svm", "Support Vector Machine",
  ["ml-ai", "supervised"], "advanced",
);
export const knnModule = createPlaceholderModule(
  "knn", "knn", "K-Nearest Neighbors",
  ["ml-ai", "supervised"], "beginner",
);
export const naiveBayesModule = createPlaceholderModule(
  "naive-bayes", "naive-bayes", "Naive Bayes",
  ["ml-ai", "supervised"], "beginner",
);

// Neural Networks
export const perceptronModule = createPlaceholderModule(
  "perceptron", "perceptron", "Perceptron",
  ["ml-ai", "neural-networks"], "beginner",
);
export const mlpForwardModule = createPlaceholderModule(
  "mlp-forward", "mlp-forward", "MLP Forward Pass",
  ["ml-ai", "neural-networks"], "intermediate",
);
export const backpropagationModule = createPlaceholderModule(
  "backpropagation", "backpropagation", "Backpropagation",
  ["ml-ai", "neural-networks"], "intermediate",
);
export const cnnModule = createPlaceholderModule(
  "cnn", "cnn", "Convolutional Neural Network",
  ["ml-ai", "neural-networks"], "advanced",
);
export const rnnModule = createPlaceholderModule(
  "rnn", "rnn", "Recurrent Neural Network",
  ["ml-ai", "neural-networks"], "advanced",
);
export const lstmModule = createPlaceholderModule(
  "lstm", "lstm", "LSTM",
  ["ml-ai", "neural-networks"], "advanced",
);

// Unsupervised Learning
export const kmeansModule = createPlaceholderModule(
  "kmeans", "kmeans", "K-Means Clustering",
  ["ml-ai", "unsupervised"], "intermediate",
);
export const dbscanModule = createPlaceholderModule(
  "dbscan", "dbscan", "DBSCAN",
  ["ml-ai", "unsupervised"], "intermediate",
);
export const hierarchicalClusteringModule = createPlaceholderModule(
  "hierarchical-clustering", "hierarchical-clustering", "Hierarchical Clustering",
  ["ml-ai", "unsupervised"], "intermediate",
);
export const pcaModule = createPlaceholderModule(
  "pca", "pca", "PCA",
  ["ml-ai", "unsupervised"], "intermediate",
);
export const autoencodersModule = createPlaceholderModule(
  "autoencoders", "autoencoders", "Autoencoders",
  ["ml-ai", "unsupervised"], "advanced",
);

// Optimization
export const gradientDescentModule = createPlaceholderModule(
  "gradient-descent", "gradient-descent", "Gradient Descent",
  ["ml-ai", "optimization-ml"], "intermediate",
);
export const sgdModule = createPlaceholderModule(
  "sgd", "sgd", "Stochastic Gradient Descent",
  ["ml-ai", "optimization-ml"], "intermediate",
);
export const adamOptimizerModule = createPlaceholderModule(
  "adam-optimizer", "adam-optimizer", "Adam Optimizer",
  ["ml-ai", "optimization-ml"], "intermediate",
);
export const rmspropModule = createPlaceholderModule(
  "rmsprop", "rmsprop", "RMSprop",
  ["ml-ai", "optimization-ml"], "intermediate",
);

// Modern AI
export const transformerAttentionModule = createPlaceholderModule(
  "transformer-attention", "transformer-attention", "Transformer Self-Attention",
  ["ml-ai", "modern-ai"], "advanced",
);
export const ragPipelineModule = createPlaceholderModule(
  "rag-pipeline", "rag-pipeline", "RAG Pipeline",
  ["ml-ai", "modern-ai"], "advanced",
);
export const vectorEmbeddingsModule = createPlaceholderModule(
  "vector-embeddings", "vector-embeddings", "Vector Embeddings",
  ["ml-ai", "modern-ai"], "intermediate",
);
export const beamSearchModule = createPlaceholderModule(
  "beam-search", "beam-search", "Beam Search",
  ["ml-ai", "modern-ai"], "intermediate",
);
export const mctsAiModule = createPlaceholderModule(
  "mcts-ai", "mcts-ai", "Monte Carlo Tree Search",
  ["ml-ai", "modern-ai"], "advanced",
);

// Reinforcement Learning
export const qLearningModule = createPlaceholderModule(
  "q-learning", "q-learning", "Q-Learning",
  ["ml-ai", "reinforcement"], "intermediate",
);
export const policyGradientModule = createPlaceholderModule(
  "policy-gradient", "policy-gradient", "Policy Gradient",
  ["ml-ai", "reinforcement"], "advanced",
);
export const dqnModule = createPlaceholderModule(
  "dqn", "dqn", "Deep Q-Network",
  ["ml-ai", "reinforcement"], "advanced",
);
