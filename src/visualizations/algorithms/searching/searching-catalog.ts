import { createPlaceholderModule } from "@/visualizations/placeholder";

export const linearSearchAlgModule = createPlaceholderModule(
  "linear-search-alg", "linear-search-alg", "Linear Search",
  ["algorithms", "searching"], "beginner",
  {
    timeComplexity: "O(n)", spaceComplexity: "O(1)",
    description: "Scan each element sequentially until the target is found.",
    pythonCode: `def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i   # Found at index i
    return -1          # Not found

# Example
arr = [2, 3, 4, 10, 40]
print(linear_search(arr, 10))   # 3
print(linear_search(arr, 99))   # -1`,
  },
);

export const binarySearchAlgModule = createPlaceholderModule(
  "binary-search-alg", "binary-search-alg", "Binary Search",
  ["algorithms", "searching"], "beginner",
  {
    timeComplexity: "O(log n)", spaceComplexity: "O(1)",
    description: "Divide sorted array in half at each step to find the target.",
    pythonCode: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Recursive version
def binary_search_recursive(arr, target, left, right):
    if left > right:
        return -1
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    return binary_search_recursive(arr, target, left, mid - 1)

# Example
arr = [2, 3, 4, 10, 40]
print(binary_search(arr, 10))   # 3`,
  },
);

export const jumpSearchModule = createPlaceholderModule(
  "jump-search", "jump-search", "Jump Search",
  ["algorithms", "searching"], "beginner",
  {
    timeComplexity: "O(√n)", spaceComplexity: "O(1)",
    description: "Jump ahead by fixed steps, then do linear search in the identified block.",
    pythonCode: `import math

def jump_search(arr, target):
    n = len(arr)
    step = int(math.sqrt(n))
    prev = 0
    while arr[min(step, n) - 1] < target:
        prev = step
        step += int(math.sqrt(n))
        if prev >= n:
            return -1
    while arr[prev] < target:
        prev += 1
        if prev == min(step, n):
            return -1
    if arr[prev] == target:
        return prev
    return -1

# Example
arr = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]
print(jump_search(arr, 55))   # 10`,
  },
);

export const interpolationSearchModule = createPlaceholderModule(
  "interpolation-search", "interpolation-search", "Interpolation Search",
  ["algorithms", "searching"], "intermediate",
  {
    timeComplexity: "O(log log n)", spaceComplexity: "O(1)",
    description: "Estimate target position using linear interpolation for uniformly distributed data.",
    pythonCode: `def interpolation_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi and arr[lo] <= target <= arr[hi]:
        if lo == hi:
            return lo if arr[lo] == target else -1
        pos = lo + ((target - arr[lo]) * (hi - lo) // (arr[hi] - arr[lo]))
        if arr[pos] == target:
            return pos
        elif arr[pos] < target:
            lo = pos + 1
        else:
            hi = pos - 1
    return -1

# Example (uniformly distributed)
arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
print(interpolation_search(arr, 70))   # 6`,
  },
);

export const exponentialSearchModule = createPlaceholderModule(
  "exponential-search", "exponential-search", "Exponential Search",
  ["algorithms", "searching"], "intermediate",
  {
    timeComplexity: "O(log n)", spaceComplexity: "O(1)",
    description: "Find range where element may exist by doubling index, then binary search.",
    pythonCode: `def binary_search(arr, target, left, right):
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: left = mid + 1
        else: right = mid - 1
    return -1

def exponential_search(arr, target):
    if arr[0] == target:
        return 0
    i = 1
    while i < len(arr) and arr[i] <= target:
        i *= 2
    return binary_search(arr, target, i // 2, min(i, len(arr) - 1))

# Example
arr = [2, 3, 4, 10, 40, 80, 120, 200]
print(exponential_search(arr, 10))   # 3`,
  },
);

export const ternarySearchModule = createPlaceholderModule(
  "ternary-search", "ternary-search", "Ternary Search",
  ["algorithms", "searching"], "intermediate",
  {
    timeComplexity: "O(log₃ n)", spaceComplexity: "O(1)",
    description: "Divide array into three parts; determine which third contains the target.",
    pythonCode: `def ternary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        third = (right - left) // 3
        mid1 = left + third
        mid2 = right - third
        if arr[mid1] == target: return mid1
        if arr[mid2] == target: return mid2
        if target < arr[mid1]:
            right = mid1 - 1
        elif target > arr[mid2]:
            left = mid2 + 1
        else:
            left = mid1 + 1
            right = mid2 - 1
    return -1

# Example
arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
print(ternary_search(arr, 13))   # 6`,
  },
);

export const fibonacciSearchModule = createPlaceholderModule(
  "fibonacci-search", "fibonacci-search", "Fibonacci Search",
  ["algorithms", "searching"], "intermediate",
  {
    timeComplexity: "O(log n)", spaceComplexity: "O(1)",
    description: "Use Fibonacci numbers to divide the array and search for the target.",
    pythonCode: `def fibonacci_search(arr, target):
    n = len(arr)
    fib2 = 0   # (m-2)th Fibonacci
    fib1 = 1   # (m-1)th Fibonacci
    fib = fib1 + fib2  # mth Fibonacci
    while fib < n:
        fib2, fib1 = fib1, fib
        fib = fib1 + fib2
    offset = -1
    while fib > 1:
        i = min(offset + fib2, n - 1)
        if arr[i] < target:
            fib = fib1; fib1 = fib2; fib2 = fib - fib1
            offset = i
        elif arr[i] > target:
            fib = fib2; fib1 = fib1 - fib2; fib2 = fib - fib1
        else:
            return i
    if fib1 and arr[offset + 1] == target:
        return offset + 1
    return -1

# Example
arr = [10, 22, 35, 40, 45, 50, 80, 82, 85, 90, 100]
print(fibonacci_search(arr, 85))   # 8`,
  },
);
