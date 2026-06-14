import type { VisualizationModule, AnimationStep } from "@/types/visualization";

function arr(stepNumber: number, description: string, lines: number[], cells: {val: string|number, state: string}[], label: string, vars: Record<string,unknown>): AnimationStep {
  return { stepNumber, description, highlightLines: lines, visualState: { type: "array1d", cells, label }, variables: vars };
}

function sc(stepNumber: number, description: string, lines: number[], points: {x:number,y:number,label?:string,cluster?:number}[], centroids: {x:number,y:number}[], title: string, vars: Record<string,unknown>): AnimationStep {
  return { stepNumber, description, highlightLines: lines, visualState: { type: "scatter", points, centroids, title }, variables: vars };
}

// ─── Linear Regression ───────────────────────────────────────────────────────
export const linearRegressionModule: VisualizationModule<number[][]> = {
  id: "linear-regression", slug: "linear-regression", title: "Linear Regression",
  category: ["ml-ai"], difficulty: "beginner",
  timeComplexity: "O(n)", spaceComplexity: "O(1)",
  description: "Fits a line y = wx + b to data by minimizing mean squared error via gradient descent.",
  relatedTopics: [],
  pythonCode: `import numpy as np

def linear_regression(X, y, lr=0.01, epochs=100):
    w, b = 0.0, 0.0
    n = len(X)
    for epoch in range(epochs):
        y_pred = w * X + b
        loss = np.mean((y_pred - y) ** 2)
        dw = (2/n) * np.sum((y_pred - y) * X)
        db = (2/n) * np.sum(y_pred - y)
        w -= lr * dw
        b -= lr * db
    return w, b

X = np.array([1,2,3,4,5], dtype=float)
y = np.array([2,4,5,4,5], dtype=float)
w, b = linear_regression(X, y)
print(f"w={w:.3f}, b={b:.3f}")`,
  codeSteps: [
    { stepNumber: 1, highlightLines: [1] },
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 11, highlightLines: [11] },
  ],
  defaultInput: [[1,2],[2,4],[3,5],[4,4],[5,5]],
  generateSteps(data) {
    const steps: AnimationStep[] = [];
    const X = data.map(d => d[0]);
    const y = data.map(d => d[1]);
    let w = 0, b = 0;
    const lr = 0.05;
    steps.push(sc(1,"Initialize w=0, b=0",[4],[...data.map((d,i)=>({x:d[0],y:d[1],label:`p${i}`}))],[],`Linear Regression (w=0, b=0)`,{w,b,epoch:0}));
    for (let ep = 1; ep <= 5; ep++) {
      const yp = X.map(x => w*x+b);
      const loss = yp.reduce((s,p,i)=>s+(p-y[i])**2,0)/X.length;
      const dw = 2/X.length * X.reduce((s,x,i)=>s+(yp[i]-y[i])*x,0);
      const db = 2/X.length * yp.reduce((s,p,i)=>s+(p-y[i]),0);
      w -= lr*dw; b -= lr*db;
      const pts = data.map((d,i)=>({x:d[0],y:d[1],label:`p${i}`}));
      steps.push(sc(ep+1,`Epoch ${ep}: loss=${loss.toFixed(3)}, w=${w.toFixed(3)}, b=${b.toFixed(3)}`,[6,7,8,9,10,11],pts,[{x:0,y:b},{x:6,y:w*6+b}],`Epoch ${ep}`,{w:w.toFixed(3),b:b.toFixed(3),loss:loss.toFixed(3)}));
    }
    return steps;
  }
};

// ─── Logistic Regression ─────────────────────────────────────────────────────
export const logisticRegressionModule: VisualizationModule<number[][]> = {
  id: "logistic-regression", slug: "logistic-regression", title: "Logistic Regression",
  category: ["ml-ai"], difficulty: "beginner",
  timeComplexity: "O(n·epochs)", spaceComplexity: "O(1)",
  description: "Binary classifier using sigmoid activation and cross-entropy loss.",
  relatedTopics: [],
  pythonCode: `import numpy as np

def sigmoid(z): return 1 / (1 + np.exp(-z))

def logistic_regression(X, y, lr=0.1, epochs=100):
    w = np.zeros(X.shape[1])
    b = 0.0
    for _ in range(epochs):
        z = X @ w + b
        a = sigmoid(z)
        loss = -np.mean(y*np.log(a+1e-9) + (1-y)*np.log(1-a+1e-9))
        dw = X.T @ (a - y) / len(y)
        db = np.mean(a - y)
        w -= lr * dw
        b -= lr * db
    return w, b`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 13, highlightLines: [13] },
  ],
  defaultInput: [[0.5,0,0],[1.5,0,1],[2.5,1,1],[3.5,1,1],[0.2,0,0]],
  generateSteps(data) {
    const steps: AnimationStep[] = [];
    const pts = data.map((d,i)=>({x:d[0],y:d[1],label:`c${d[2]}`,cluster:d[2]}));
    steps.push(sc(1,"Logistic Regression: classify 2D points",[6],pts,[],`Logistic Regression`,{w:"[0,0]",b:0}));
    steps.push(sc(2,"Compute sigmoid probabilities for each point",[8,9],pts,[],`After sigmoid`,{note:"sigmoid(z) → prob"}));
    steps.push(sc(3,"Compute cross-entropy loss",[10],pts,[],`Cross-entropy loss`,{loss:"computed"}));
    steps.push(sc(4,"Update weights via gradient descent",[11,12,13],pts,[],`Weights updated`,{converging:true}));
    steps.push(sc(5,"Decision boundary learned",[14],pts,[{x:0,y:0.5},{x:4,y:0.5}],`Decision Boundary`,{accuracy:"80%"}));
    return steps;
  }
};

// ─── Decision Tree (ML) ───────────────────────────────────────────────────────
export const decisionTreeMlModule: VisualizationModule<number[][]> = {
  id: "decision-tree-ml", slug: "decision-tree-ml", title: "Decision Tree",
  category: ["ml-ai"], difficulty: "intermediate",
  timeComplexity: "O(n·m·log n)", spaceComplexity: "O(n)",
  description: "Recursive partitioning using information gain (entropy) or Gini impurity.",
  relatedTopics: [],
  pythonCode: `import math

def entropy(labels):
    n = len(labels)
    counts = {}
    for l in labels: counts[l] = counts.get(l,0)+1
    return -sum((c/n)*math.log2(c/n) for c in counts.values() if c)

def best_split(X, y):
    best_gain, best_feat, best_thresh = 0, 0, 0
    base_ent = entropy(y)
    for feat in range(len(X[0])):
        thresholds = sorted(set(x[feat] for x in X))
        for t in thresholds:
            left  = [y[i] for i,x in enumerate(X) if x[feat] <= t]
            right = [y[i] for i,x in enumerate(X) if x[feat] > t]
            if not left or not right: continue
            gain = base_ent - (len(left)/len(y))*entropy(left) - (len(right)/len(y))*entropy(right)
            if gain > best_gain:
                best_gain, best_feat, best_thresh = gain, feat, t
    return best_feat, best_thresh, best_gain`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 13, highlightLines: [13] },
    { stepNumber: 15, highlightLines: [15] },
  ],
  defaultInput: [[2,3,0],[5,7,1],[1,1,0],[8,5,1],[4,6,1],[3,2,0]],
  generateSteps(data) {
    const steps: AnimationStep[] = [];
    const pts = data.map(d=>({x:d[0],y:d[1],cluster:d[2],label:`c${d[2]}`}));
    steps.push(sc(1,"All data at root node — compute entropy",[3,4,5,6],pts,[],`Root (H=1.0)`,{entropy:"1.0"}));
    steps.push(sc(2,"Try splitting on feature 0 (x-axis)",[8,9,10],pts,[{x:3.5,y:0},{x:3.5,y:8}],`Try x≤3.5`,{feature:0,threshold:3.5}));
    steps.push(sc(3,"Compute information gain for x≤3.5",[13],pts,[{x:3.5,y:0},{x:3.5,y:8}],`Gain=0.42`,{gain:0.42}));
    steps.push(sc(4,"Best split found: x≤3.5, gain=0.42",[15],pts,[{x:3.5,y:0},{x:3.5,y:8}],`Best Split`,{feat:"x",thresh:3.5,gain:0.42}));
    steps.push(sc(5,"Recurse on left and right subsets",[8],pts,[{x:3.5,y:0},{x:3.5,y:8}],`Recursive split`,{depth:2}));
    return steps;
  }
};

// ─── Random Forest ────────────────────────────────────────────────────────────
export const randomForestModule: VisualizationModule<number> = {
  id: "random-forest", slug: "random-forest", title: "Random Forest",
  category: ["ml-ai"], difficulty: "intermediate",
  timeComplexity: "O(n·T·m·log n)", spaceComplexity: "O(T·n)",
  description: "Ensemble of decision trees trained on bootstrap samples with feature bagging.",
  relatedTopics: [],
  pythonCode: `import random, math

def bootstrap(X, y):
    n = len(X)
    idx = [random.randint(0, n-1) for _ in range(n)]
    return [X[i] for i in idx], [y[i] for i in idx]

def random_forest_predict(trees, x):
    votes = [tree.predict(x) for tree in trees]
    return max(set(votes), key=votes.count)  # majority vote

# Training: fit T trees on bootstrap samples
trees = []
for t in range(T):
    Xb, yb = bootstrap(X, y)
    tree = DecisionTree(max_features=sqrt(m))
    tree.fit(Xb, yb)
    trees.append(tree)`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: 5,
  generateSteps(T) {
    const steps: AnimationStep[] = [];
    const cells = (n:number) => Array.from({length:n},(_,i)=>({val:`T${i+1}`,state:i<T?"active":"default"}));
    steps.push(arr(1,"Initialize random forest with T trees",[12],[{val:"T="+T,state:"active"}],"Trees",{T}));
    for (let t = 1; t <= T; t++) {
      steps.push(arr(t+1,`Tree ${t}: bootstrap sample + train`,[13,14,15],cells(t),`Trained Trees`,{t,bootstrapped:true}));
    }
    steps.push(arr(T+2,"Predict: majority vote from all trees",[8],cells(T),"Final Ensemble",{vote:"majority",accuracy:"↑"}));
    return steps;
  }
};

// ─── SVM ─────────────────────────────────────────────────────────────────────
export const svmModule: VisualizationModule<number[][]> = {
  id: "svm", slug: "svm", title: "Support Vector Machine",
  category: ["ml-ai"], difficulty: "advanced",
  timeComplexity: "O(n²) to O(n³)", spaceComplexity: "O(n)",
  description: "Finds the maximum-margin hyperplane between classes using support vectors.",
  relatedTopics: [],
  pythonCode: `import numpy as np

def svm_kernel(x1, x2, kernel='linear'):
    if kernel == 'linear': return np.dot(x1, x2)
    if kernel == 'rbf':    return np.exp(-np.linalg.norm(x1-x2)**2)

# Dual formulation (simplified)
# Maximize: Σαi - 0.5 Σi Σj αi αj yi yj K(xi,xj)
# Subject to: 0 ≤ αi ≤ C, Σ αi yi = 0
# Support vectors: points where αi > 0

def predict(x, support_vecs, alphas, ys, b):
    return np.sign(sum(
        alphas[i] * ys[i] * svm_kernel(support_vecs[i], x)
        for i in range(len(support_vecs))
    ) + b)`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: [[1,1,0],[1.5,2,0],[3,3,1],[3.5,2,1],[2,1.5,0],[2.5,3.5,1]],
  generateSteps(data) {
    const steps: AnimationStep[] = [];
    const pts = data.map(d=>({x:d[0],y:d[1],cluster:d[2],label:`c${d[2]}`}));
    steps.push(sc(1,"Plot training data — two classes",[1],pts,[],`SVM Training Data`,{}));
    steps.push(sc(2,"Find support vectors (closest points to boundary)",[10],pts,[{x:2,y:0},{x:2,y:4}],`Support Vectors`,{margin:"2d"}));
    steps.push(sc(3,"Maximize margin between hyperplanes",[7,8,9],pts,[{x:2,y:0},{x:2,y:4}],`Max Margin`,{margin:"maximized"}));
    steps.push(sc(4,"Decision boundary at margin center",[12,13,14,15],pts,[{x:2.2,y:0},{x:2.2,y:4}],`Decision Boundary`,{kernel:"linear"}));
    steps.push(sc(5,"RBF kernel maps to higher dimensions",[4],pts,[{x:2.2,y:0},{x:2.2,y:4}],`RBF Kernel`,{kernel:"rbf",accuracy:"↑"}));
    return steps;
  }
};

// ─── KNN ─────────────────────────────────────────────────────────────────────
export const knnModule: VisualizationModule<{k:number,query:[number,number]}> = {
  id: "knn", slug: "knn", title: "K-Nearest Neighbors",
  category: ["ml-ai"], difficulty: "beginner",
  timeComplexity: "O(n·d)", spaceComplexity: "O(n)",
  description: "Classifies by majority vote among the K closest training examples.",
  relatedTopics: [],
  pythonCode: `import heapq, math

def euclidean(a, b):
    return math.sqrt(sum((ai-bi)**2 for ai,bi in zip(a,b)))

def knn_classify(X_train, y_train, query, k):
    dists = [(euclidean(query, x), y) for x, y in zip(X_train, y_train)]
    knn = heapq.nsmallest(k, dists)
    votes = {}
    for _, label in knn:
        votes[label] = votes.get(label, 0) + 1
    return max(votes, key=votes.get)`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 11, highlightLines: [11] },
  ],
  defaultInput: {k:3, query:[3,3]},
  generateSteps({k, query}) {
    const train = [{x:1,y:2,cluster:0},{x:2,y:1,cluster:0},{x:1.5,y:3,cluster:0},{x:4,y:4,cluster:1},{x:5,y:3,cluster:1},{x:4.5,y:5,cluster:1}];
    const steps: AnimationStep[] = [];
    steps.push(sc(1,"Place query point and training data",[6],[...train,{x:query[0],y:query[1],label:"?",cluster:2}],[],`KNN (k=${k})`,{query}));
    const dists = train.map((p,i)=>({...p,d:Math.hypot(p.x-query[0],p.y-query[1]),i})).sort((a,b)=>a.d-b.d);
    steps.push(sc(2,"Compute distances to all points",[6],train.map((p,i)=>({...p,label:`${Math.hypot(p.x-query[0],p.y-query[1]).toFixed(1)}`})),[],`Distances computed`,{sorted:dists.map(d=>d.d.toFixed(2))}));
    const knn = dists.slice(0,k);
    steps.push(sc(3,`Select ${k} nearest neighbors`,[7],[...train.map((p,i)=>({...p,label:knn.find(n=>n.i===i)?"★":""})),{x:query[0],y:query[1],label:"?",cluster:2}],[],`K=${k} Selected`,{neighbors:knn.map(n=>n.cluster)}));
    const vote = knn.reduce((a,n)=>{a[n.cluster]=(a[n.cluster]||0)+1;return a},{} as Record<number,number>);
    const pred = +Object.entries(vote).sort((a,b)=>b[1]-a[1])[0][0];
    steps.push(sc(4,`Majority vote → class ${pred}`,[11],[...train,{x:query[0],y:query[1],label:`c${pred}`,cluster:pred}],[],`Prediction: class ${pred}`,{votes:vote,prediction:pred}));
    return steps;
  }
};

// ─── Naive Bayes ──────────────────────────────────────────────────────────────
export const naiveBayesModule: VisualizationModule<string[]> = {
  id: "naive-bayes", slug: "naive-bayes", title: "Naive Bayes",
  category: ["ml-ai"], difficulty: "beginner",
  timeComplexity: "O(n·d)", spaceComplexity: "O(d·C)",
  description: "Probabilistic classifier using Bayes theorem with feature independence assumption.",
  relatedTopics: [],
  pythonCode: `from collections import defaultdict

def train_naive_bayes(docs, labels):
    class_counts = defaultdict(int)
    word_counts = defaultdict(lambda: defaultdict(int))
    vocab = set()
    for doc, label in zip(docs, labels):
        class_counts[label] += 1
        for word in doc:
            word_counts[label][word] += 1
            vocab.add(word)
    return class_counts, word_counts, vocab

def predict(doc, class_counts, word_counts, vocab):
    total = sum(class_counts.values())
    scores = {}
    for cls, cnt in class_counts.items():
        score = cnt / total  # P(class)
        for word in doc:     # P(word|class) with Laplace smoothing
            score *= (word_counts[cls][word] + 1) / (sum(word_counts[cls].values()) + len(vocab))
        scores[cls] = score
    return max(scores, key=scores.get)`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 15, highlightLines: [15] },
    { stepNumber: 19, highlightLines: [19] },
  ],
  defaultInput: ["good great excellent","bad terrible awful","good bad mediocre"],
  generateSteps(docs) {
    const steps: AnimationStep[] = [];
    // Tokenize each document from the actual input.
    const tokens = docs.map(d => String(d).toLowerCase().split(/\s+/).filter(Boolean));
    // Build vocabulary (unique words across all docs), capped for display.
    const vocab = Array.from(new Set(tokens.flat())).slice(0, 12);

    // Label docs alternately as the two classes so we have a real NB model.
    const labelOf = (i: number) => (i % 2 === 0 ? "A" : "B");
    const make = (active: Set<string>, highlight: Set<string> = new Set()) =>
      vocab.map(w => ({
        val: w,
        state: highlight.has(w) ? "highlighted" : active.has(w) ? "active" : "default",
      }));

    // Step 1: vocabulary built from the input
    steps.push(arr(1, `Build vocabulary from ${docs.length} document(s): ${vocab.length} unique word(s).`,
      [3,4,5], make(new Set(vocab)), "Vocabulary", { vocab }));

    // One step per document showing its words + class label
    const countA: Record<string, number> = {};
    const countB: Record<string, number> = {};
    let nA = 0, nB = 0;
    tokens.forEach((toks, i) => {
      const cls = labelOf(i);
      if (cls === "A") nA++; else nB++;
      for (const w of toks) {
        if (cls === "A") countA[w] = (countA[w] || 0) + 1;
        else countB[w] = (countB[w] || 0) + 1;
      }
      steps.push(arr(2 + i, `Doc ${i + 1} → class ${cls}: "${docs[i]}"`,
        [6,7,8,9,10], make(new Set(toks)), `Class ${cls} counts`,
        { doc: docs[i], class: cls, words: toks }));
    });

    // Priors from actual class distribution
    const total = docs.length || 1;
    steps.push(arr(2 + tokens.length, `Priors: P(A)=${(nA/total).toFixed(2)}, P(B)=${(nB/total).toFixed(2)}.`,
      [13,14], make(new Set()), "Priors", { "P(A)": +(nA/total).toFixed(2), "P(B)": +(nB/total).toFixed(2) }));

    // Classify the last document against the trained counts (Laplace smoothing)
    const query = tokens[tokens.length - 1] ?? [];
    const sumA = Object.values(countA).reduce((s,v)=>s+v,0);
    const sumB = Object.values(countB).reduce((s,v)=>s+v,0);
    let scoreA = nA/total, scoreB = nB/total;
    for (const w of query) {
      scoreA *= ((countA[w]||0)+1)/(sumA + vocab.length);
      scoreB *= ((countB[w]||0)+1)/(sumB + vocab.length);
    }
    const pred = scoreA >= scoreB ? "A" : "B";
    steps.push(arr(3 + tokens.length, `Classify "${docs[docs.length-1]}" → class ${pred} (max posterior).`,
      [19], make(new Set(query), new Set(query)), `Prediction: class ${pred}`,
      { "score(A)": scoreA.toExponential(2), "score(B)": scoreB.toExponential(2), prediction: pred }));
    return steps;
  }
};

// ─── Perceptron ───────────────────────────────────────────────────────────────
export const perceptronModule: VisualizationModule<number[][]> = {
  id: "perceptron", slug: "perceptron", title: "Perceptron",
  category: ["ml-ai"], difficulty: "beginner",
  timeComplexity: "O(n·epochs)", spaceComplexity: "O(d)",
  description: "Single-layer linear classifier; the building block of neural networks.",
  relatedTopics: [],
  pythonCode: `def perceptron_train(X, y, lr=0.1, epochs=10):
    w = [0.0] * len(X[0])
    b = 0.0
    for epoch in range(epochs):
        for xi, yi in zip(X, y):
            z = sum(wi*xij for wi,xij in zip(w,xi)) + b
            y_hat = 1 if z >= 0 else 0
            err = yi - y_hat
            for j in range(len(w)):
                w[j] += lr * err * xi[j]
            b += lr * err
    return w, b`,
  codeSteps: [
    { stepNumber: 2, highlightLines: [2] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 9, highlightLines: [9] },
  ],
  defaultInput: [[0,0,0],[0,1,1],[1,0,1],[1,1,1]],
  generateSteps(data) {
    const steps: AnimationStep[] = [];
    const pts = data.map(d=>({x:d[0]+Math.random()*0.1,y:d[1]+Math.random()*0.1,cluster:d[2],label:`(${d[0]},${d[1]})`}));
    steps.push(sc(1,"OR gate: train perceptron on 4 examples",[2],pts,[],`Perceptron Training`,{w:"[0,0]",b:0}));
    steps.push(sc(2,"Epoch 1: (0,0)→0 correct, no update",[5,6,7,8],pts,[],`Epoch 1`,{correct:true}));
    steps.push(sc(3,"(0,1)→0 wrong, update w and b",[9,10],pts,[{x:-1,y:0.5},{x:1.5,y:0.5}],`Update weights`,{err:1,w:"[0.1,0.1]",b:0.1}));
    steps.push(sc(4,"Convergence: linear boundary found",[6,7],pts,[{x:-0.5,y:0.5},{x:1.5,y:-0.5}],`Converged`,{w:"[1,1]",b:-0.5}));
    return steps;
  }
};

// ─── MLP Forward Pass ─────────────────────────────────────────────────────────
export const mlpForwardModule: VisualizationModule<number[]> = {
  id: "mlp-forward", slug: "mlp-forward", title: "MLP Forward Pass",
  category: ["ml-ai"], difficulty: "intermediate",
  timeComplexity: "O(L·d²)", spaceComplexity: "O(L·d)",
  description: "Multi-layer perceptron: compute activations layer by layer.",
  relatedTopics: [],
  pythonCode: `import numpy as np

def relu(z): return np.maximum(0, z)
def softmax(z): e = np.exp(z - z.max()); return e / e.sum()

def mlp_forward(X, weights, biases):
    a = X
    activations = [a]
    for W, b in zip(weights[:-1], biases[:-1]):
        z = a @ W + b      # linear
        a = relu(z)        # activation
        activations.append(a)
    # Output layer
    z = a @ weights[-1] + biases[-1]
    a = softmax(z)
    activations.append(a)
    return activations`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 13, highlightLines: [13] },
  ],
  defaultInput: [0.5, 0.8, 0.2],
  generateSteps(x) {
    const steps: AnimationStep[] = [];
    const inp = x.map((v,i)=>({val:v.toFixed(2),state:"active"}));
    steps.push(arr(1,"Input layer: feed x into network",[7],inp,"Input",{layer:0}));
    const h1 = x.map(v=>Math.max(0,v*0.6+0.1));
    steps.push(arr(2,"Hidden layer 1: z=Wx+b, then ReLU",[9,10],h1.map(v=>({val:v.toFixed(2),state:"computed"})),"Hidden 1 (ReLU)",{layer:1}));
    const h2 = h1.map(v=>Math.max(0,v*0.5-0.05));
    steps.push(arr(3,"Hidden layer 2: apply ReLU again",[9,10],h2.map(v=>({val:v.toFixed(2),state:"computed"})),"Hidden 2",{layer:2}));
    const raw = h2.map((v,i)=>v*[1.2,-0.8,0.9][i%3]);
    const expv = raw.map(v=>Math.exp(v));
    const sum = expv.reduce((a,b)=>a+b,0);
    const soft = expv.map(v=>v/sum);
    steps.push(arr(4,"Output layer: softmax probabilities",[13,14],soft.map((v,i)=>({val:v.toFixed(3),state:i===soft.indexOf(Math.max(...soft))?"highlighted":"default"})),"Output (Softmax)",{predicted:soft.indexOf(Math.max(...soft))}));
    return steps;
  }
};

// ─── Backpropagation ──────────────────────────────────────────────────────────
export const backpropagationModule: VisualizationModule<number[]> = {
  id: "backpropagation", slug: "backpropagation", title: "Backpropagation",
  category: ["ml-ai"], difficulty: "advanced",
  timeComplexity: "O(L·d²)", spaceComplexity: "O(L·d)",
  description: "Compute gradients via chain rule, propagating error from output to input.",
  relatedTopics: [],
  pythonCode: `import numpy as np

def backprop(activations, weights, y_true, lr=0.01):
    L = len(weights)
    deltas = [None] * L
    # Output layer delta
    deltas[-1] = activations[-1] - y_true
    # Backpropagate
    for l in range(L-2, -1, -1):
        deltas[l] = (deltas[l+1] @ weights[l+1].T) * relu_grad(activations[l+1])
    # Update weights
    for l in range(L):
        weights[l] -= lr * activations[l].T @ deltas[l]
    return weights`,
  codeSteps: [
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 11, highlightLines: [11] },
  ],
  defaultInput: [0.8, 0.1, 0.1],
  generateSteps(yTrue) {
    const steps: AnimationStep[] = [];
    const outLayer = yTrue.map((v,i)=>({val:v.toFixed(2),state:"active"}));
    const pred = [0.6,0.3,0.1];
    const delta = pred.map((p,i)=>p-yTrue[i]);
    steps.push(arr(1,"Forward pass complete; output vs. true label",[5],pred.map((v,i)=>({val:v.toFixed(2),state:i===0?"highlighted":"default"})),"Output",{predicted:pred,true:yTrue}));
    steps.push(arr(2,"Output delta = predicted - true",[6],delta.map(v=>({val:v.toFixed(3),state:Math.abs(v)>0.1?"active":"default"})),"Output δ",{delta}));
    steps.push(arr(3,"Backprop to hidden layer 2 via chain rule",[8,9],delta.map(v=>({val:(v*0.5).toFixed(3),state:"computed"})),"Hidden-2 δ",{layer:2}));
    steps.push(arr(4,"Backprop to hidden layer 1",[8,9],delta.map(v=>({val:(v*0.25).toFixed(3),state:"computed"})),"Hidden-1 δ",{layer:1}));
    steps.push(arr(5,"Update all weights: W -= lr·aᵀ·δ",[11,12],pred.map((v,i)=>({val:(v+0.01*yTrue[i]).toFixed(3),state:"highlighted"})),"Updated Weights",{lr:0.01,done:true}));
    return steps;
  }
};

// ─── CNN ──────────────────────────────────────────────────────────────────────
export const cnnModule: VisualizationModule<number[][]> = {
  id: "cnn", slug: "cnn", title: "Convolutional Neural Network",
  category: ["ml-ai"], difficulty: "advanced",
  timeComplexity: "O(n·k²·c_in·c_out)", spaceComplexity: "O(n·c)",
  description: "Applies learnable filters (convolutions) to extract spatial features.",
  relatedTopics: [],
  pythonCode: `import numpy as np

def conv2d(input, kernel, stride=1, pad=0):
    H, W = input.shape
    kH, kW = kernel.shape
    out_H = (H + 2*pad - kH) // stride + 1
    out_W = (W + 2*pad - kW) // stride + 1
    output = np.zeros((out_H, out_W))
    for i in range(out_H):
        for j in range(out_W):
            region = input[i*stride:i*stride+kH, j*stride:j*stride+kW]
            output[i,j] = np.sum(region * kernel)
    return output

def max_pool(feature_map, size=2):
    H, W = feature_map.shape
    out = np.zeros((H//size, W//size))
    for i in range(0, H, size):
        for j in range(0, W, size):
            out[i//size, j//size] = feature_map[i:i+size, j:j+size].max()
    return out`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: [[1,0,1,0],[0,1,0,1],[1,0,1,0],[0,1,0,1]],
  generateSteps(img) {
    const steps: AnimationStep[] = [];
    const flat = img.flat().map((v,i)=>({val:v,state:"default" as string}));
    steps.push(arr(1,"Input image (4×4)",[3],flat,"Input (4×4)",{size:"4×4"}));
    const kern = [1,0,-1,0,1,0,-1,0,1];
    steps.push(arr(2,"Apply 3×3 edge-detection kernel",[9,10],kern.map(v=>({val:v,state:"active" as string})),"Kernel (3×3)",{kernel:"edge"}));
    const conv = [0,1,-1,0, 1,0,0,-1, -1,0,0,1, 0,-1,1,0].map(v=>({val:v,state:v!==0?"computed":"default" as string}));
    steps.push(arr(3,"Convolution output after sliding kernel",[9,10,11],conv.slice(0,4),"Conv Output (2×2)",{stride:1}));
    steps.push(arr(4,"ReLU: max(0, conv_out)",[3],conv.slice(0,4).map(c=>({val:Math.max(0,+c.val),state:"active" as string})),"After ReLU",{}));
    steps.push(arr(5,"Max pooling 2×2 → 1×1",[14,15,16,17,18],conv.slice(0,1).map(c=>({val:1,state:"highlighted" as string})),"After MaxPool",{size:"1×1"}));
    return steps;
  }
};

// ─── RNN ──────────────────────────────────────────────────────────────────────
export const rnnModule: VisualizationModule<number[]> = {
  id: "rnn", slug: "rnn", title: "Recurrent Neural Network",
  category: ["ml-ai"], difficulty: "advanced",
  timeComplexity: "O(T·d²)", spaceComplexity: "O(d)",
  description: "Processes sequences by maintaining a hidden state across time steps.",
  relatedTopics: [],
  pythonCode: `import numpy as np

def tanh(z): return np.tanh(z)

def rnn_step(x_t, h_prev, W_xh, W_hh, b_h, W_hy, b_y):
    # Hidden state update
    h_t = tanh(W_xh @ x_t + W_hh @ h_prev + b_h)
    # Output
    y_t = W_hy @ h_t + b_y
    return h_t, y_t

def rnn_forward(X, h0, W_xh, W_hh, b_h, W_hy, b_y):
    h = h0
    outputs = []
    for x_t in X:
        h, y = rnn_step(x_t, h, W_xh, W_hh, b_h, W_hy, b_y)
        outputs.append(y)
    return outputs, h`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: [0.2, 0.5, -0.3, 0.8, 0.1],
  generateSteps(seq) {
    const steps: AnimationStep[] = [];
    let h = 0;
    steps.push(arr(1,"Initial hidden state h₀ = 0",[12],[{val:h.toFixed(2),state:"active"}],"h₀",{t:0}));
    seq.forEach((x,t) => {
      h = Math.tanh(0.5*x + 0.8*h);
      const y = 0.6*h;
      steps.push(arr(t+2,`Step ${t+1}: x=${x}, h_t=${h.toFixed(3)}, y=${y.toFixed(3)}`,[6,7,8],
        [{val:x,state:"active"},{val:h.toFixed(3),state:"computed"},{val:y.toFixed(3),state:"highlighted"}],
        `t=${t+1}: x,h,y`,{h:h.toFixed(3),y:y.toFixed(3)}));
    });
    return steps;
  }
};

// ─── LSTM ─────────────────────────────────────────────────────────────────────
export const lstmModule: VisualizationModule<number[]> = {
  id: "lstm", slug: "lstm", title: "LSTM",
  category: ["ml-ai"], difficulty: "advanced",
  timeComplexity: "O(T·d²)", spaceComplexity: "O(d)",
  description: "Long Short-Term Memory: gates control what to remember and forget.",
  relatedTopics: [],
  pythonCode: `import numpy as np

def sigmoid(z): return 1/(1+np.exp(-z))

def lstm_step(x, h_prev, c_prev, params):
    W_f, W_i, W_c, W_o, b_f, b_i, b_c, b_o = params
    combined = np.concatenate([h_prev, x])
    f = sigmoid(W_f @ combined + b_f)   # forget gate
    i = sigmoid(W_i @ combined + b_i)   # input gate
    c_tilde = np.tanh(W_c @ combined + b_c)  # candidate
    o = sigmoid(W_o @ combined + b_o)   # output gate
    c = f * c_prev + i * c_tilde        # cell state
    h = o * np.tanh(c)                  # hidden state
    return h, c`,
  codeSteps: [
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 13, highlightLines: [13] },
  ],
  defaultInput: [0.3, -0.2, 0.7, 0.1],
  generateSteps(seq) {
    const steps: AnimationStep[] = [];
    const sig = (z: number) => 1/(1+Math.exp(-z));
    let c = 0, h = 0;
    steps.push(arr(1,"LSTM initialized: h₀=0, c₀=0",[5],[{val:"h=0",state:"active"},{val:"c=0",state:"active"}],"Initial State",{h:0,c:0}));
    seq.forEach((x,t) => {
      const f = sig(0.4*h+0.3*x-0.1);
      const i = sig(0.5*h+0.4*x+0.2);
      const cTilde = Math.tanh(0.6*h+0.5*x);
      const o = sig(0.3*h+0.6*x+0.1);
      c = f*c + i*cTilde;
      h = o*Math.tanh(c);
      steps.push(arr(t+2,`t=${t+1}: forget=${f.toFixed(2)}, input=${i.toFixed(2)}, output_gate=${o.toFixed(2)}`,[8,9,10,11,12,13],
        [{val:`f=${f.toFixed(2)}`,state:"active"},{val:`i=${i.toFixed(2)}`,state:"computed"},{val:`c=${c.toFixed(2)}`,state:"highlighted"},{val:`h=${h.toFixed(2)}`,state:"active"}],
        `Gates at t=${t+1}`,{f:f.toFixed(2),i:i.toFixed(2),c:c.toFixed(3),h:h.toFixed(3)}));
    });
    return steps;
  }
};

// ─── K-Means ──────────────────────────────────────────────────────────────────
export const kmeansModule: VisualizationModule<{k:number,points:number[][]}> = {
  id: "kmeans", slug: "kmeans", title: "K-Means Clustering",
  category: ["ml-ai"], difficulty: "intermediate",
  timeComplexity: "O(n·k·iterations)", spaceComplexity: "O(n+k)",
  description: "Partition n points into k clusters by iteratively updating centroids.",
  relatedTopics: [],
  pythonCode: `import random, math

def euclidean(a, b):
    return math.sqrt(sum((ai-bi)**2 for ai,bi in zip(a,b)))

def kmeans(points, k, max_iter=100):
    centroids = random.sample(points, k)
    for _ in range(max_iter):
        # Assign each point to nearest centroid
        clusters = [[] for _ in range(k)]
        for p in points:
            nearest = min(range(k), key=lambda i: euclidean(p, centroids[i]))
            clusters[nearest].append(p)
        # Update centroids
        new_centroids = [
            [sum(x[d] for x in c)/len(c) for d in range(len(points[0]))]
            for c in clusters if c
        ]
        if new_centroids == centroids: break
        centroids = new_centroids
    return clusters, centroids`,
  codeSteps: [
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 19, highlightLines: [19] },
  ],
  defaultInput: {k:2, points:[[1,2],[1.5,1.8],[5,8],[8,8],[1,0.6],[9,11]]},
  generateSteps({k, points}) {
    const steps: AnimationStep[] = [];
    // Clamp k to a sane range — can't have more clusters than points
    k = Math.max(1, Math.min(k, points.length));
    const pts = points.map((p,i)=>({x:p[0],y:p[1],label:`p${i}`,cluster:-1}));
    // random init
    let centroids = points.slice(0,k).map(p=>({x:p[0],y:p[1]}));
    steps.push(sc(1,`Initialize ${k} centroids randomly`,[7],pts.map(p=>({...p,cluster:0})),centroids,`K-Means Init (k=${k})`,{iter:0}));
    for (let iter = 1; iter <= 3; iter++) {
      const assigned = pts.map(p=>{
        const dists = centroids.map(c=>Math.hypot(p.x-c.x,p.y-c.y));
        return {...p,cluster:dists.indexOf(Math.min(...dists))};
      });
      steps.push(sc(iter+1,`Iter ${iter}: assign points to nearest centroid`,[9,10,11],assigned,centroids,`Assign (iter=${iter})`,{iter}));
      centroids = Array.from({length:k},(_,ci)=>{
        const cl = assigned.filter(p=>p.cluster===ci);
        return cl.length?{x:cl.reduce((s,p)=>s+p.x,0)/cl.length,y:cl.reduce((s,p)=>s+p.y,0)/cl.length}:centroids[ci];
      });
      steps.push(sc(iter+4,`Iter ${iter}: update centroids to cluster means`,[14,15,16,17],assigned,centroids,`Update Centroids`,{centroids}));
    }
    return steps;
  }
};

// ─── DBSCAN ───────────────────────────────────────────────────────────────────
export const dbscanModule: VisualizationModule<{eps:number,minPts:number}> = {
  id: "dbscan", slug: "dbscan", title: "DBSCAN",
  category: ["ml-ai"], difficulty: "intermediate",
  timeComplexity: "O(n²)", spaceComplexity: "O(n)",
  description: "Density-based clustering that finds arbitrarily shaped clusters and marks outliers.",
  relatedTopics: [],
  pythonCode: `def dbscan(points, eps, min_pts):
    labels = [-1] * len(points)  # -1 = unvisited
    cluster_id = 0
    for i, p in enumerate(points):
        if labels[i] != -1: continue
        neighbors = [j for j,q in enumerate(points) if dist(p,q) <= eps]
        if len(neighbors) < min_pts:
            labels[i] = 0  # noise
        else:
            cluster_id += 1
            labels[i] = cluster_id
            seed_set = list(neighbors)
            while seed_set:
                q_idx = seed_set.pop()
                if labels[q_idx] == 0: labels[q_idx] = cluster_id
                if labels[q_idx] != -1: continue
                labels[q_idx] = cluster_id
                q_neighbors = [j for j,r in enumerate(points) if dist(points[q_idx],r)<=eps]
                if len(q_neighbors) >= min_pts:
                    seed_set.extend(q_neighbors)
    return labels`,
  codeSteps: [
    { stepNumber: 2, highlightLines: [2] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: {eps:1.5, minPts:2},
  generateSteps({eps, minPts}) {
    const pts = [{x:1,y:1},{x:1.5,y:1.2},{x:5,y:5},{x:5.5,y:5},{x:10,y:10},{x:1.2,y:0.9}];
    const n = pts.length;
    const steps: AnimationStep[] = [];
    // cluster: -1 = unvisited, 0 = noise, >=1 = cluster id
    const labels = new Array(n).fill(-1);
    const dist = (a:number,b:number)=>Math.hypot(pts[a].x-pts[b].x, pts[a].y-pts[b].y);
    const regionQuery = (i:number)=>pts.map((_,j)=>j).filter(j=>dist(i,j)<=eps);

    const render = (label:string, vars:Record<string,unknown>) =>
      steps.push(sc(
        steps.length+1, label, [2],
        pts.map((p,i)=>({...p, cluster: labels[i] < 0 ? -1 : labels[i]})),
        [], `DBSCAN (eps=${eps}, minPts=${minPts})`, vars));

    render(`Start: all points unvisited. eps=${eps}, minPts=${minPts}.`, {eps, minPts});

    let clusterId = 0;
    for (let i = 0; i < n; i++) {
      if (labels[i] !== -1) continue;
      const neighbors = regionQuery(i);
      if (neighbors.length < minPts) {
        labels[i] = 0; // noise (for now)
        render(`p${i}: ${neighbors.length} neighbor(s) < minPts → mark noise.`, {point:i, neighbors:neighbors.length});
        continue;
      }
      clusterId++;
      labels[i] = clusterId;
      const seeds = neighbors.filter(j => j !== i);
      render(`p${i}: core point (${neighbors.length} neighbors) → start cluster ${clusterId}.`, {point:i, cluster:clusterId});
      // expand
      for (let s = 0; s < seeds.length; s++) {
        const q = seeds[s];
        if (labels[q] === 0) labels[q] = clusterId;       // noise → border
        if (labels[q] !== -1) continue;
        labels[q] = clusterId;
        const qn = regionQuery(q);
        if (qn.length >= minPts) {
          for (const x of qn) if (!seeds.includes(x)) seeds.push(x);
        }
      }
      render(`Cluster ${clusterId} fully expanded.`, {cluster:clusterId, size: labels.filter(l=>l===clusterId).length});
    }

    const noise = labels.map((l,i)=>l===0?i:-1).filter(i=>i>=0);
    render(`Done. ${clusterId} cluster(s), ${noise.length} noise point(s).`, {clusters:clusterId, noise});
    return steps;
  }
};

// ─── Hierarchical Clustering ──────────────────────────────────────────────────
export const hierarchicalClusteringModule: VisualizationModule<number[][]> = {
  id: "hierarchical-clustering", slug: "hierarchical-clustering", title: "Hierarchical Clustering",
  category: ["ml-ai"], difficulty: "intermediate",
  timeComplexity: "O(n³)", spaceComplexity: "O(n²)",
  description: "Agglomerative bottom-up clustering — merge closest clusters iteratively.",
  relatedTopics: [],
  pythonCode: `def agglomerative(points, linkage='single'):
    clusters = [[i] for i in range(len(points))]
    history = []
    while len(clusters) > 1:
        min_dist = float('inf')
        merge_a, merge_b = 0, 1
        for i in range(len(clusters)):
            for j in range(i+1, len(clusters)):
                d = cluster_dist(clusters[i], clusters[j], points, linkage)
                if d < min_dist:
                    min_dist, merge_a, merge_b = d, i, j
        new_cluster = clusters[merge_a] + clusters[merge_b]
        history.append((merge_a, merge_b, min_dist))
        clusters = [c for k,c in enumerate(clusters)
                    if k != merge_a and k != merge_b] + [new_cluster]
    return history`,
  codeSteps: [
    { stepNumber: 2, highlightLines: [2] },
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: [[1,2],[1.5,1.8],[5,8],[8,8],[1,0.6]],
  generateSteps(points) {
    const steps: AnimationStep[] = [];
    const pts = points.map((p,i)=>({x:p[0],y:p[1],label:`p${i}`,cluster:i}));
    steps.push(sc(1,"Each point is its own cluster",[2],pts,[],`Init: ${points.length} clusters`,{clusters:points.length}));
    steps.push(sc(2,"Find closest pair: p0 and p1 (d=0.54)",[8,9,10],pts.map((p,i)=>({...p,cluster:i<2?0:i})),[],`Merge p0+p1`,{merged:"p0,p1",dist:0.54}));
    steps.push(sc(3,"Now 4 clusters; find next closest pair",[8,9,10],pts.map((p,i)=>({...p,cluster:i<2?0:i===4?0:i})),[],`3 clusters`,{clusters:3}));
    steps.push(sc(4,"Merge cluster {p2,p3} — distance 4.24",[11,12],pts.map((p,i)=>({...p,cluster:i<2||i===4?0:1})),[],`2 clusters`,{clusters:2}));
    steps.push(sc(5,"Final merge: one cluster",[4],pts.map(p=>({...p,cluster:0})),[],`1 cluster (done)`,{clusters:1}));
    return steps;
  }
};

// ─── PCA ─────────────────────────────────────────────────────────────────────
export const pcaModule: VisualizationModule<number[][]> = {
  id: "pca", slug: "pca", title: "Principal Component Analysis",
  category: ["ml-ai"], difficulty: "advanced",
  timeComplexity: "O(n·d² + d³)", spaceComplexity: "O(d²)",
  description: "Reduces dimensionality by projecting onto directions of maximum variance.",
  relatedTopics: [],
  pythonCode: `import numpy as np

def pca(X, n_components):
    # Center data
    mean = X.mean(axis=0)
    X_c = X - mean
    # Covariance matrix
    cov = X_c.T @ X_c / (len(X) - 1)
    # Eigendecomposition
    eigenvalues, eigenvectors = np.linalg.eigh(cov)
    # Sort by descending eigenvalue
    idx = eigenvalues.argsort()[::-1]
    eigenvectors = eigenvectors[:, idx]
    # Project
    W = eigenvectors[:, :n_components]
    X_reduced = X_c @ W
    return X_reduced, W`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: [[2.5,2.4],[0.5,0.7],[2.2,2.9],[1.9,2.2],[3.1,3.0],[2.3,2.7]],
  generateSteps(data) {
    const steps: AnimationStep[] = [];
    const pts = data.map((d,i)=>({x:d[0],y:d[1],label:`p${i}`,cluster:0}));
    const mx = data.reduce((s,d)=>s+d[0],0)/data.length;
    const my = data.reduce((s,d)=>s+d[1],0)/data.length;
    const centered = data.map((d,i)=>({x:d[0]-mx,y:d[1]-my,label:`p${i}`,cluster:0}));
    steps.push(sc(1,"Original data in 2D",[4],pts,[],`Original Data`,{n:data.length,d:2}));
    steps.push(sc(2,`Center data (mean=[${mx.toFixed(2)},${my.toFixed(2)}])`,[4,5],centered,[],`Centered Data`,{mean:[mx.toFixed(2),my.toFixed(2)]}));
    steps.push(sc(3,"Compute covariance matrix",[7],centered,[{x:0,y:0},{x:1,y:1}],`Covariance`,{cov:"computed"}));
    steps.push(sc(4,"Find principal component (max variance direction)",[8,9,10],centered,[{x:-1.5,y:-1.5},{x:1.5,y:1.5}],`PC1 direction`,{pc1:"[0.71,0.71]"}));
    const proj = centered.map((p,i)=>{const v=0.71*p.x+0.71*p.y; return {x:v,y:0,label:`p${i}`,cluster:0};});
    steps.push(sc(5,"Project onto PC1: 2D → 1D",[12,13],proj,[],`1D Projection`,{variance_retained:"97%"}));
    return steps;
  }
};

// ─── Autoencoders ────────────────────────────────────────────────────────────
export const autoencodersModule: VisualizationModule<number[]> = {
  id: "autoencoders", slug: "autoencoders", title: "Autoencoders",
  category: ["ml-ai"], difficulty: "advanced",
  timeComplexity: "O(epochs·n·d²)", spaceComplexity: "O(d)",
  description: "Encoder-decoder network that learns compressed latent representations.",
  relatedTopics: [],
  pythonCode: `import numpy as np

def relu(z): return np.maximum(0, z)

class Autoencoder:
    def encode(self, x):
        h = relu(self.W_enc @ x + self.b_enc)  # compress
        z = self.W_lat @ h + self.b_lat          # latent
        return z
    def decode(self, z):
        h = relu(self.W_dec @ z + self.b_dec)   # expand
        x_hat = self.W_out @ h + self.b_out      # reconstruct
        return x_hat
    def loss(self, x):
        return np.mean((x - self.decode(self.encode(x)))**2)`,
  codeSteps: [
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 13, highlightLines: [13] },
  ],
  defaultInput: [0.8, 0.2, 0.9, 0.1, 0.7],
  generateSteps(x) {
    const steps: AnimationStep[] = [];
    const inp = x.map(v=>({val:v.toFixed(2),state:"active" as string}));
    steps.push(arr(1,"Input x (d=5)",[5],inp,"Input",{d:5}));
    const h1 = x.map(v=>Math.max(0,v*0.6-0.1));
    steps.push(arr(2,"Encoder hidden layer (ReLU)",[6],h1.map(v=>({val:v.toFixed(2),state:"computed" as string})),"Encoder h",{dim:5}));
    const z = [h1.reduce((s,v)=>s+v,0)/h1.length, h1[0]-h1[h1.length-1]];
    steps.push(arr(3,"Latent space z (dim=2) — bottleneck",[7],z.map(v=>({val:v.toFixed(3),state:"highlighted" as string})),"Latent z",{dim:2,compression:"5→2"}));
    const h2 = x.map((_,i)=>Math.max(0,z[0]*0.5+z[1]*(i%2===0?1:-1)));
    steps.push(arr(4,"Decoder expands latent to hidden",[10],h2.map(v=>({val:v.toFixed(2),state:"computed" as string})),"Decoder h",{dim:5}));
    const xhat = h2.map((v,i)=>v*0.8+x[i]*0.2);
    const loss = xhat.reduce((s,v,i)=>s+(v-x[i])**2,0)/x.length;
    steps.push(arr(5,`Reconstruction x̂, MSE loss=${loss.toFixed(4)}`,[11,13],xhat.map((v,i)=>({val:v.toFixed(2),state:Math.abs(v-x[i])<0.1?"highlighted":"active" as string})),"Reconstructed x̂",{loss:loss.toFixed(4)}));
    return steps;
  }
};

// ─── Gradient Descent ─────────────────────────────────────────────────────────
export const gradientDescentModule: VisualizationModule<{lr:number,steps:number}> = {
  id: "gradient-descent", slug: "gradient-descent", title: "Gradient Descent",
  category: ["ml-ai"], difficulty: "beginner",
  timeComplexity: "O(steps)", spaceComplexity: "O(1)",
  description: "Iteratively update parameters in the negative gradient direction to minimize loss.",
  relatedTopics: [],
  pythonCode: `def gradient_descent(f, grad_f, x0, lr=0.1, steps=50):
    x = x0
    history = [x]
    for _ in range(steps):
        g = grad_f(x)      # compute gradient
        x = x - lr * g     # step opposite gradient
        history.append(x)
    return x, history

# Example: minimize f(x) = x^2
f      = lambda x: x**2
grad_f = lambda x: 2*x
x_opt, hist = gradient_descent(f, grad_f, x0=4.0, lr=0.2)`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: {lr: 0.2, steps: 6},
  generateSteps({lr, steps}) {
    const stepList: AnimationStep[] = [];
    let x = 4.0;
    stepList.push(arr(1,`Start at x=${x}, f(x)=${(x*x).toFixed(2)}`,[1,2],[{val:x.toFixed(3),state:"active"},{val:(x*x).toFixed(3),state:"default"}],"x, f(x)",{x,loss:x*x}));
    for (let i = 1; i <= steps; i++) {
      const g = 2*x;
      x = x - lr*g;
      stepList.push(arr(i+1,`Step ${i}: grad=${g.toFixed(2)}, x=${x.toFixed(3)}, f(x)=${(x*x).toFixed(4)}`,[5,6],[{val:x.toFixed(3),state:Math.abs(x)<0.01?"highlighted":"active"},{val:(x*x).toFixed(4),state:"computed"}],"x, f(x)",{grad:g.toFixed(2),x:x.toFixed(3),loss:(x*x).toFixed(4)}));
    }
    return stepList;
  }
};

// ─── SGD ──────────────────────────────────────────────────────────────────────
export const sgdModule: VisualizationModule<{lr:number,batchSize:number}> = {
  id: "sgd", slug: "sgd", title: "Stochastic Gradient Descent",
  category: ["ml-ai"], difficulty: "beginner",
  timeComplexity: "O(epochs·n/b)", spaceComplexity: "O(b)",
  description: "Uses random mini-batches to estimate gradients — faster and noisier than full GD.",
  relatedTopics: [],
  pythonCode: `import random

def sgd(X, y, w, lr=0.01, batch_size=32, epochs=10):
    n = len(X)
    for epoch in range(epochs):
        indices = list(range(n))
        random.shuffle(indices)                   # shuffle data
        for i in range(0, n, batch_size):
            batch = indices[i:i+batch_size]        # mini-batch
            X_b = [X[j] for j in batch]
            y_b = [y[j] for j in batch]
            grad = compute_gradient(X_b, y_b, w)  # stochastic grad
            w = w - lr * grad                      # update
    return w`,
  codeSteps: [
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: {lr: 0.01, batchSize: 2},
  generateSteps({lr, batchSize}) {
    const n = 8;
    const steps: AnimationStep[] = [];
    steps.push(arr(1,`Dataset n=${n}, batch_size=${batchSize}`,[3],Array.from({length:n},(_,i)=>({val:`x${i}`,state:"default"})),"Full Dataset",{n,batchSize}));
    steps.push(arr(2,"Shuffle dataset",[6,7],Array.from({length:n},(_,i)=>({val:`x${(i*3)%n}`,state:"active"})),"Shuffled",{}));
    for (let b = 0; b < n/batchSize; b++) {
      const batch = Array.from({length:n},(_, i)=>({val:`x${i}`,state:Math.floor(i/batchSize)===b?"active":"default" as string}));
      steps.push(arr(b+3,`Mini-batch ${b+1}: compute gradient and update`,[8,9,10,11,12],batch,`Batch ${b+1}`,{batch:b+1,lr}));
    }
    return steps;
  }
};

// ─── Adam Optimizer ───────────────────────────────────────────────────────────
export const adamOptimizerModule: VisualizationModule<{lr:number,beta1:number,beta2:number}> = {
  id: "adam-optimizer", slug: "adam-optimizer", title: "Adam Optimizer",
  category: ["ml-ai"], difficulty: "intermediate",
  timeComplexity: "O(steps)", spaceComplexity: "O(d)",
  description: "Adaptive moment estimation: combines momentum and RMSProp.",
  relatedTopics: [],
  pythonCode: `import numpy as np

def adam(grad_fn, theta, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8, steps=1000):
    m = np.zeros_like(theta)  # 1st moment
    v = np.zeros_like(theta)  # 2nd moment
    for t in range(1, steps+1):
        g = grad_fn(theta)
        m = beta1*m + (1-beta1)*g          # momentum
        v = beta2*v + (1-beta2)*(g**2)     # velocity
        m_hat = m / (1 - beta1**t)         # bias correction
        v_hat = v / (1 - beta2**t)
        theta -= lr * m_hat / (np.sqrt(v_hat) + eps)
    return theta`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: {lr:0.001, beta1:0.9, beta2:0.999},
  generateSteps({lr, beta1, beta2}) {
    const steps: AnimationStep[] = [];
    let theta = 4.0, m = 0, v = 0, eps = 1e-8;
    steps.push(arr(1,"Initialize m=0, v=0, θ=4.0",[4,5],[{val:"m=0",state:"default"},{val:"v=0",state:"default"},{val:"θ=4.0",state:"active"}],"Adam Init",{m,v,theta}));
    for (let t = 1; t <= 5; t++) {
      const g = 2*theta;
      m = beta1*m + (1-beta1)*g;
      v = beta2*v + (1-beta2)*g*g;
      const mh = m/(1-Math.pow(beta1,t));
      const vh = v/(1-Math.pow(beta2,t));
      theta -= lr*mh/(Math.sqrt(vh)+eps);
      steps.push(arr(t+1,`Step ${t}: g=${g.toFixed(2)}, θ=${theta.toFixed(4)}`,[7,8,9,10,11,12],
        [{val:`m̂=${mh.toFixed(3)}`,state:"active"},{val:`v̂=${vh.toFixed(3)}`,state:"computed"},{val:`θ=${theta.toFixed(4)}`,state:"highlighted"}],
        `Adam step ${t}`,{g:g.toFixed(2),theta:theta.toFixed(4),m:m.toFixed(3),v:v.toFixed(3)}));
    }
    return steps;
  }
};

// ─── RMSProp ──────────────────────────────────────────────────────────────────
export const rmspropModule: VisualizationModule<{lr:number,decay:number}> = {
  id: "rmsprop", slug: "rmsprop", title: "RMSProp",
  category: ["ml-ai"], difficulty: "intermediate",
  timeComplexity: "O(steps)", spaceComplexity: "O(d)",
  description: "Adapts learning rate by dividing by a running average of squared gradients.",
  relatedTopics: [],
  pythonCode: `def rmsprop(grad_fn, theta, lr=0.001, decay=0.9, eps=1e-8, steps=100):
    v = 0.0  # running mean of squared gradients
    for t in range(steps):
        g = grad_fn(theta)
        v = decay * v + (1-decay) * g**2   # update moving avg
        theta -= lr * g / (v**0.5 + eps)   # adaptive step
    return theta`,
  codeSteps: [
    { stepNumber: 2, highlightLines: [2] },
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 6, highlightLines: [6] },
  ],
  defaultInput: {lr: 0.001, decay: 0.9},
  generateSteps({lr, decay}) {
    const steps: AnimationStep[] = [];
    let theta = 4.0, v = 0, eps = 1e-8;
    steps.push(arr(1,"Initialize v=0, θ=4.0",[2],[{val:"v=0",state:"default"},{val:"θ=4.0",state:"active"}],"RMSProp Init",{v,theta}));
    for (let t = 1; t <= 5; t++) {
      const g = 2*theta;
      v = decay*v + (1-decay)*g*g;
      theta -= lr*g/(Math.sqrt(v)+eps);
      steps.push(arr(t+1,`Step ${t}: v=${v.toFixed(3)}, θ=${theta.toFixed(4)}`,[4,5,6],
        [{val:`v=${v.toFixed(3)}`,state:"computed"},{val:`g=${g.toFixed(2)}`,state:"active"},{val:`θ=${theta.toFixed(4)}`,state:"highlighted"}],
        `RMSProp step ${t}`,{g:g.toFixed(2),v:v.toFixed(3),theta:theta.toFixed(4)}));
    }
    return steps;
  }
};

// ─── Transformer Attention ────────────────────────────────────────────────────
export const transformerAttentionModule: VisualizationModule<string[]> = {
  id: "transformer-attention", slug: "transformer-attention", title: "Transformer Attention",
  category: ["ml-ai"], difficulty: "advanced",
  timeComplexity: "O(n²·d)", spaceComplexity: "O(n²)",
  description: "Scaled dot-product attention: Q·Kᵀ/√d → softmax → ·V",
  relatedTopics: [],
  pythonCode: `import numpy as np

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.shape[-1]
    # Scores: how much each query attends to each key
    scores = Q @ K.T / np.sqrt(d_k)
    if mask is not None:
        scores = scores + mask * -1e9  # causal mask
    weights = softmax(scores, axis=-1)
    output = weights @ V
    return output, weights

# Multi-head: run h parallel attention heads
def multi_head_attention(Q, K, V, h=8):
    d_model, d_k = Q.shape[-1], Q.shape[-1] // h
    heads = [attention(Q_i, K_i, V_i) for Q_i,K_i,V_i in split_heads(Q,K,V,h)]
    return concat(heads) @ W_o`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: ["The","cat","sat","on","mat"],
  generateSteps(tokens) {
    const steps: AnimationStep[] = [];
    const n = tokens.length;
    const toks = tokens.map((t,i)=>({val:t,state:"default" as string}));
    steps.push(arr(1,"Tokens → Query, Key, Value matrices via W_Q, W_K, W_V",[3],toks,"Tokens",{n,d_model:512}));
    const scores = tokens.map((t,i)=>({val:`s${i}`,state:"active" as string}));
    steps.push(arr(2,"Compute Q·Kᵀ attention scores (n×n matrix)",[5],scores,"Scores (n×n)",{scaled:true,d_k:64}));
    steps.push(arr(3,"Apply softmax: each row sums to 1",[7],tokens.map((t,i)=>({val:(1/n).toFixed(2),state:"computed" as string})),"Attention Weights",{sum:"1.0"}));
    steps.push(arr(4,"Weighted sum of Values: output = weights·V",[8],tokens.map((t,i)=>({val:`o${i}`,state:"highlighted" as string})),"Context Output",{dim:512}));
    steps.push(arr(5,"Multi-head: 8 heads, concatenated + projected",[12,13,14],tokens.map((t,i)=>({val:`h${i}`,state:"active" as string})),"Multi-Head Output",{heads:8}));
    return steps;
  }
};

// ─── RAG Pipeline ─────────────────────────────────────────────────────────────
export const ragPipelineModule: VisualizationModule<string> = {
  id: "rag-pipeline", slug: "rag-pipeline", title: "RAG Pipeline",
  category: ["ml-ai"], difficulty: "intermediate",
  timeComplexity: "O(n·d + k·d)", spaceComplexity: "O(n·d)",
  description: "Retrieval-Augmented Generation: retrieve relevant docs, then generate conditioned answer.",
  relatedTopics: [],
  pythonCode: `from sentence_transformers import SentenceTransformer
import faiss, numpy as np

# Build index
model = SentenceTransformer('all-MiniLM-L6-v2')
corpus_embeddings = model.encode(corpus)
index = faiss.IndexFlatL2(corpus_embeddings.shape[1])
index.add(corpus_embeddings)

def rag_query(question, k=3):
    q_emb = model.encode([question])        # embed query
    D, I = index.search(q_emb, k)           # retrieve k docs
    context = " ".join(corpus[i] for i in I[0])
    prompt = f"Context: {context}\\nQ: {question}\\nA:"
    answer = llm.generate(prompt)            # augmented generation
    return answer`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 14, highlightLines: [14] },
  ],
  defaultInput: "What is attention mechanism?",
  generateSteps(query) {
    const steps: AnimationStep[] = [];
    const docs = ["Attention weighs tokens","Transformers use self-attention","BERT uses bidirectional attention"];
    const d = docs.map((t,i)=>({val:t.slice(0,12)+"…",state:"default" as string}));
    steps.push(arr(1,"Corpus documents in vector store",[5,6],d,"Corpus",{n:docs.length}));
    steps.push(arr(2,`Embed query: "${query.slice(0,20)}…"`,[10],[{val:"query",state:"active"},{val:"embed→",state:"default"},{val:"[0.2,0.8…]",state:"computed"}],"Query Embedding",{dim:384}));
    steps.push(arr(3,"ANN search: find top-3 similar docs",[11],d.map((doc,i)=>({...doc,state:i<2?"highlighted":"default"})),"Retrieved (k=3)",{k:3,distances:"[0.12,0.23]"}));
    steps.push(arr(4,"Build augmented prompt with context",[12,13],[{val:"Context:",state:"active"},{val:docs[0].slice(0,10),state:"highlighted"},{val:"Q:"+query.slice(0,10),state:"computed"}],"Prompt",{tokens:128}));
    steps.push(arr(5,"LLM generates answer from augmented prompt",[14],[{val:"Answer:",state:"active"},{val:"Attention…",state:"highlighted"}],"Generated Answer",{model:"GPT/Llama"}));
    return steps;
  }
};

// ─── Vector Embeddings ────────────────────────────────────────────────────────
export const vectorEmbeddingsModule: VisualizationModule<string[]> = {
  id: "vector-embeddings", slug: "vector-embeddings", title: "Vector Embeddings",
  category: ["ml-ai"], difficulty: "beginner",
  timeComplexity: "O(n·d)", spaceComplexity: "O(n·d)",
  description: "Map discrete tokens to dense vectors capturing semantic similarity.",
  relatedTopics: [],
  pythonCode: `import numpy as np

# Embedding lookup table: vocab_size × d_model
E = np.random.randn(vocab_size, d_model) * 0.01

def embed(token_ids):
    return E[token_ids]  # lookup rows

# Semantic similarity via cosine
def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Word2Vec skip-gram: train embeddings
def skip_gram_loss(center, context, negatives, E):
    pos = np.dot(E[center], E[context])
    neg = sum(np.dot(E[center], E[n]) for n in negatives)
    return -np.log(sigmoid(pos)) - sum(np.log(sigmoid(-neg_s)) for neg_s in [neg])`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 6, highlightLines: [6] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 13, highlightLines: [13] },
  ],
  defaultInput: ["king","queen","man","woman","Paris","France"],
  generateSteps(words) {
    const steps: AnimationStep[] = [];
    const pts = words.map((w,i)=>({x:Math.cos(i*Math.PI/3)*2+2,y:Math.sin(i*Math.PI/3)*2+2,label:w,cluster:i<2?0:i<4?1:2}));
    steps.push(sc(1,"Words mapped to 2D embedding space",[3,6],pts,[],`Word Embeddings`,{vocab:words.length,d:2}));
    steps.push(sc(2,"king-man+woman ≈ queen (analogy)",[9],pts,[{x:2.5,y:2.5}],`Analogy arithmetic`,{analogy:"king-man+woman=queen"}));
    steps.push(sc(3,"Paris-France+Germany ≈ Berlin",[9],pts,[{x:3,y:3}],`Country-capital`,{pair:"France→Paris"}));
    steps.push(sc(4,"Cosine similarity between related words is high",[9],pts,[],`Similarity Matrix`,{sim:"king↔queen: 0.87"}));
    return steps;
  }
};

// ─── Beam Search ──────────────────────────────────────────────────────────────
export const beamSearchModule: VisualizationModule<{beamWidth:number,vocab:string[]}> = {
  id: "beam-search", slug: "beam-search", title: "Beam Search",
  category: ["ml-ai"], difficulty: "intermediate",
  timeComplexity: "O(T·B·V)", spaceComplexity: "O(B·T)",
  description: "Decoding strategy that keeps top-B candidates at each step instead of greedy argmax.",
  relatedTopics: [],
  pythonCode: `import heapq

def beam_search(model, start_token, beam_width, max_len, vocab):
    beams = [([start_token], 0.0)]  # (sequence, log_prob)
    for step in range(max_len):
        candidates = []
        for seq, score in beams:
            probs = model.next_token_probs(seq)
            for token_id, log_p in enumerate(probs):
                candidates.append((seq + [token_id], score + log_p))
        # Keep top beam_width candidates
        beams = heapq.nlargest(beam_width, candidates, key=lambda x: x[1])
    return beams[0][0]  # best sequence`,
  codeSteps: [
    { stepNumber: 3, highlightLines: [3] },
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 10, highlightLines: [10] },
    { stepNumber: 12, highlightLines: [12] },
  ],
  defaultInput: {beamWidth: 2, vocab: ["<s>","the","cat","sat","dog","ran"]},
  generateSteps({beamWidth, vocab}) {
    const steps: AnimationStep[] = [];
    const v = vocab.slice(0,4);
    steps.push(arr(1,"Start: beam=[<s>], score=0",[3],[{val:"<s>",state:"active"},...v.map(t=>({val:t,state:"default" as string}))],"Beams t=0",{beamWidth}));
    steps.push(arr(2,"Expand: score each vocab token from <s>",[5,6,7],v.map((t,i)=>({val:t,state:i<beamWidth?"highlighted":"default" as string})),"Candidates t=1",{n:v.length}));
    steps.push(arr(3,`Keep top ${beamWidth}: "the"(-0.4), "cat"(-0.9)`,[10],[{val:"the",state:"active"},{val:"cat",state:"active"},{val:"sat",state:"default"},{val:"dog",state:"default"}],`Beams t=1 (B=${beamWidth})`,{kept:beamWidth}));
    steps.push(arr(4,"Expand again from each kept beam",[5,6,7],v.map((t,i)=>({val:t,state:"computed" as string})),"Candidates t=2",{}));
    steps.push(arr(5,"Final: best sequence selected",[12],[{val:"the",state:"highlighted"},{val:"cat",state:"highlighted"},{val:"sat",state:"highlighted"}],"Best Sequence",{score:"-1.3"}));
    return steps;
  }
};

// ─── MCTS ─────────────────────────────────────────────────────────────────────
export const mctsAiModule: VisualizationModule<number> = {
  id: "mcts-ai", slug: "mcts-ai", title: "Monte Carlo Tree Search",
  category: ["ml-ai"], difficulty: "advanced",
  timeComplexity: "O(simulations · depth)", spaceComplexity: "O(nodes)",
  description: "Four phases: selection (UCT), expansion, simulation (rollout), backpropagation.",
  relatedTopics: [],
  pythonCode: `import math, random

C = math.sqrt(2)  # exploration constant

def uct_score(node):
    if node.visits == 0: return float('inf')
    return node.wins/node.visits + C*math.sqrt(math.log(node.parent.visits)/node.visits)

def mcts(root, n_simulations):
    for _ in range(n_simulations):
        # 1. Selection: follow UCT
        node = root
        while node.is_fully_expanded() and node.children:
            node = max(node.children, key=uct_score)
        # 2. Expansion
        if not node.is_terminal():
            node = node.expand()
        # 3. Simulation (rollout)
        result = node.simulate()
        # 4. Backpropagation
        while node:
            node.visits += 1
            node.wins += result
            node = node.parent`,
  codeSteps: [
    { stepNumber: 5, highlightLines: [5] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 12, highlightLines: [12] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 16, highlightLines: [16] },
  ],
  defaultInput: 4,
  generateSteps(simulations) {
    const steps: AnimationStep[] = [];
    const root = [{val:"root",state:"active"},{val:"N=0,W=0",state:"default"}];
    steps.push(arr(1,"Root node, no simulations yet",[9],root,"Tree (root)",{N:0,W:0}));
    for (let s = 1; s <= simulations; s++) {
      const w = Math.random()>0.4?1:0;
      steps.push(arr(s+1,`Sim ${s}: select→expand→rollout(${w?"win":"loss"})→backprop`,[9,12,14,16,17,18,19],
        [{val:`root`,state:"active"},{val:`N=${s},W=${Math.round(s*0.6)}`,state:"computed"},{val:`UCT=…`,state:"highlighted"}],
        `After sim ${s}`,{N:s,W:Math.round(s*0.6),result:w}));
    }
    steps.push(arr(simulations+2,"Pick child with most visits as best move",[9],[{val:"best",state:"highlighted"},{val:`N=${simulations}`,state:"active"}],"Best Move",{done:true}));
    return steps;
  }
};

// ─── Q-Learning ───────────────────────────────────────────────────────────────
export const qLearningModule: VisualizationModule<{states:number,actions:number}> = {
  id: "q-learning", slug: "q-learning", title: "Q-Learning",
  category: ["ml-ai"], difficulty: "advanced",
  timeComplexity: "O(episodes·steps)", spaceComplexity: "O(S·A)",
  description: "Model-free RL: learn Q(s,a) table via Bellman equation updates.",
  relatedTopics: [],
  pythonCode: `import random

def q_learning(env, episodes, alpha=0.1, gamma=0.99, epsilon=0.1):
    Q = {}  # Q-table: state → {action: value}
    for episode in range(episodes):
        state = env.reset()
        done = False
        while not done:
            # Epsilon-greedy action selection
            if random.random() < epsilon:
                action = env.action_space.sample()
            else:
                action = max(Q.get(state, {}), key=Q[state].get, default=0)
            next_state, reward, done = env.step(action)
            # Bellman update
            old_q = Q.get(state, {}).get(action, 0)
            best_next = max(Q.get(next_state, {}).values(), default=0)
            Q.setdefault(state, {})[action] = old_q + alpha*(reward + gamma*best_next - old_q)
            state = next_state
    return Q`,
  codeSteps: [
    { stepNumber: 4, highlightLines: [4] },
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 11, highlightLines: [11] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 16, highlightLines: [16] },
  ],
  defaultInput: {states: 4, actions: 2},
  generateSteps({states, actions}) {
    const steps: AnimationStep[] = [];
    const qt = Array.from({length:states*actions},(_, i)=>({val:"0.00",state:"default" as string}));
    steps.push(arr(1,"Initialize Q-table to zeros",[4],qt,`Q-table (${states}×${actions})`,{states,actions}));
    const updates = [{s:0,a:0,r:1,q:0.1},{s:0,a:1,r:-1,q:-0.09},{s:1,a:0,r:0,q:0.09},{s:2,a:1,r:1,q:0.18}];
    updates.forEach((u,ep) => {
      const row = [...qt];
      row[u.s*actions+u.a] = {val:u.q.toFixed(2),state:"highlighted"};
      steps.push(arr(ep+2,`Ep ${ep+1}: s=${u.s},a=${u.a},r=${u.r} → Q[${u.s}][${u.a}]=${u.q}`,[9,10,11,12,14,15,16],row,`Q-table (ep ${ep+1})`,{s:u.s,a:u.a,r:u.r,new_q:u.q}));
    });
    return steps;
  }
};

// ─── Policy Gradient ──────────────────────────────────────────────────────────
export const policyGradientModule: VisualizationModule<number> = {
  id: "policy-gradient", slug: "policy-gradient", title: "Policy Gradient (REINFORCE)",
  category: ["ml-ai"], difficulty: "advanced",
  timeComplexity: "O(episodes·T)", spaceComplexity: "O(T)",
  description: "Directly optimize policy π_θ by ascending the expected return gradient.",
  relatedTopics: [],
  pythonCode: `import numpy as np

def reinforce(policy_net, env, lr=0.01, episodes=1000, gamma=0.99):
    optimizer = Adam(policy_net.parameters(), lr=lr)
    for episode in range(episodes):
        states, actions, rewards = [], [], []
        state = env.reset()
        done = False
        while not done:
            action = policy_net.sample_action(state)  # stochastic policy
            next_state, reward, done = env.step(action)
            states.append(state); actions.append(action); rewards.append(reward)
            state = next_state
        # Compute discounted returns
        G = 0; returns = []
        for r in reversed(rewards):
            G = r + gamma * G
            returns.insert(0, G)
        # Policy gradient update
        loss = -sum(log_prob(s,a) * G for s,a,G in zip(states,actions,returns))
        optimizer.zero_grad(); loss.backward(); optimizer.step()`,
  codeSteps: [
    { stepNumber: 9, highlightLines: [9] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 18, highlightLines: [18] },
    { stepNumber: 19, highlightLines: [19] },
  ],
  defaultInput: 5,
  generateSteps(episodes) {
    const steps: AnimationStep[] = [];
    steps.push(arr(1,"Initialize policy network π_θ",[3,4],[{val:"θ→random",state:"active"}],"Policy",{lr:0.01,gamma:0.99}));
    for (let ep = 1; ep <= episodes; ep++) {
      const ret = Math.min(ep*2, 10)+Math.random()*2;
      const loss = -(ret*0.3).toFixed(3);
      steps.push(arr(ep+1,`Episode ${ep}: collect trajectory, G=${ret.toFixed(1)}, loss=${loss}`,[9,10,11,12,14,15,16,18,19],
        [{val:`ep${ep}`,state:"active"},{val:`G=${ret.toFixed(1)}`,state:"computed"},{val:`loss=${loss}`,state:"highlighted"}],
        `Episode ${ep}`,{G:ret.toFixed(1),loss}));
    }
    steps.push(arr(episodes+2,"Policy converged — θ optimized",[19],[{val:"θ*",state:"highlighted"},{val:"optimal",state:"active"}],"Converged",{done:true}));
    return steps;
  }
};

// ─── DQN ──────────────────────────────────────────────────────────────────────
export const dqnModule: VisualizationModule<number> = {
  id: "dqn", slug: "dqn", title: "Deep Q-Network (DQN)",
  category: ["ml-ai"], difficulty: "advanced",
  timeComplexity: "O(episodes·steps·d²)", spaceComplexity: "O(buffer+d²)",
  description: "Q-learning with neural network function approximation, replay buffer, and target network.",
  relatedTopics: [],
  pythonCode: `import random
from collections import deque

class DQN:
    def __init__(self, state_dim, action_dim):
        self.q_net = NeuralNet(state_dim, action_dim)
        self.target_net = NeuralNet(state_dim, action_dim)
        self.replay_buffer = deque(maxlen=10000)
        self.target_net.load_state_dict(self.q_net.state_dict())

    def train_step(self, batch_size=32):
        batch = random.sample(self.replay_buffer, batch_size)
        s, a, r, s2, done = zip(*batch)
        # Target: r + γ * max Q_target(s', a')
        with torch.no_grad():
            target_q = r + gamma * target_net(s2).max(dim=1).values * (1-done)
        # Prediction from online network
        pred_q = q_net(s).gather(1, a)
        loss = F.mse_loss(pred_q, target_q)
        optimizer.zero_grad(); loss.backward(); optimizer.step()
        # Periodically sync target
        if step % target_update == 0:
            target_net.load_state_dict(q_net.state_dict())`,
  codeSteps: [
    { stepNumber: 7, highlightLines: [7] },
    { stepNumber: 8, highlightLines: [8] },
    { stepNumber: 14, highlightLines: [14] },
    { stepNumber: 16, highlightLines: [16] },
    { stepNumber: 17, highlightLines: [17] },
    { stepNumber: 20, highlightLines: [20] },
  ],
  defaultInput: 5,
  generateSteps(steps) {
    const stepList: AnimationStep[] = [];
    stepList.push(arr(1,"Initialize Q-net and target-net (identical weights)",[5,6,7,8],
      [{val:"Q-net",state:"active"},{val:"Target",state:"computed"},{val:"Buffer:[]",state:"default"}],"DQN Init",{buffer:0}));
    for (let ep = 1; ep <= steps; ep++) {
      const bufSize = Math.min(ep*8, 64);
      const loss = (1.5/ep).toFixed(3);
      stepList.push(arr(ep+1,`Step ${ep}: sample batch, compute TD target, update Q-net`,[11,12,13,14,15,16,17,18],
        [{val:`buf=${bufSize}`,state:"active"},{val:`loss=${loss}`,state:"computed"},{val:ep%2===0?"sync target":"—",state:ep%2===0?"highlighted":"default"}],
        `DQN step ${ep}`,{bufSize,loss,targetSync:ep%2===0}));
    }
    stepList.push(arr(steps+2,"Training complete — Q-net approximates optimal Q*",[20],
      [{val:"Q*",state:"highlighted"},{val:"converged",state:"active"}],"Converged",{done:true}));
    return stepList;
  }
};

export const mlAiModules = [
  linearRegressionModule, logisticRegressionModule, decisionTreeMlModule,
  randomForestModule, svmModule, knnModule, naiveBayesModule,
  perceptronModule, mlpForwardModule, backpropagationModule,
  cnnModule, rnnModule, lstmModule,
  kmeansModule, dbscanModule, hierarchicalClusteringModule,
  pcaModule, autoencodersModule,
  gradientDescentModule, sgdModule, adamOptimizerModule, rmspropModule,
  transformerAttentionModule, ragPipelineModule, vectorEmbeddingsModule,
  beamSearchModule, mctsAiModule, qLearningModule, policyGradientModule, dqnModule,
];
