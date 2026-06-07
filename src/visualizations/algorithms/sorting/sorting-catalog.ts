import { createPlaceholderModule } from "@/visualizations/placeholder";

export const selectionSortModule = createPlaceholderModule(
  "selection-sort", "selection-sort", "Selection Sort",
  ["algorithms", "sorting"], "beginner",
  {
    timeComplexity: "O(n²)", spaceComplexity: "O(1)",
    description: "Find the minimum element and place it at the front, repeatedly.",
    pythonCode: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

# Example
arr = [64, 25, 12, 22, 11]
print(selection_sort(arr))  # [11, 12, 22, 25, 64]`,
  },
);

export const insertionSortModule = createPlaceholderModule(
  "insertion-sort", "insertion-sort", "Insertion Sort",
  ["algorithms", "sorting"], "beginner",
  {
    timeComplexity: "O(n²)", spaceComplexity: "O(1)",
    description: "Build sorted array one element at a time by inserting each into its correct position.",
    pythonCode: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

# Example
arr = [12, 11, 13, 5, 6]
print(insertion_sort(arr))  # [5, 6, 11, 12, 13]`,
  },
);

export const shellSortModule = createPlaceholderModule(
  "shell-sort", "shell-sort", "Shell Sort",
  ["algorithms", "sorting"], "intermediate",
  {
    timeComplexity: "O(n log² n)", spaceComplexity: "O(1)",
    description: "Generalization of insertion sort that allows the exchange of far-apart elements.",
    pythonCode: `def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr

# Example
arr = [12, 34, 54, 2, 3]
print(shell_sort(arr))  # [2, 3, 12, 34, 54]`,
  },
);

export const heapSortModule = createPlaceholderModule(
  "heap-sort", "heap-sort", "Heap Sort",
  ["algorithms", "sorting"], "intermediate",
  {
    timeComplexity: "O(n log n)", spaceComplexity: "O(1)",
    description: "Build a max-heap, then repeatedly extract the maximum to sort the array.",
    pythonCode: `def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    return arr

# Example
arr = [12, 11, 13, 5, 6, 7]
print(heap_sort(arr))  # [5, 6, 7, 11, 12, 13]`,
  },
);

export const countingSortModule = createPlaceholderModule(
  "counting-sort", "counting-sort", "Counting Sort",
  ["algorithms", "sorting"], "beginner",
  {
    timeComplexity: "O(n + k)", spaceComplexity: "O(k)",
    description: "Count occurrences of each element and reconstruct the sorted array.",
    pythonCode: `def counting_sort(arr):
    if not arr:
        return arr
    max_val = max(arr)
    count = [0] * (max_val + 1)
    for num in arr:
        count[num] += 1
    result = []
    for i, c in enumerate(count):
        result.extend([i] * c)
    return result

# Example
arr = [4, 2, 2, 8, 3, 3, 1]
print(counting_sort(arr))  # [1, 2, 2, 3, 3, 4, 8]`,
  },
);

export const radixSortModule = createPlaceholderModule(
  "radix-sort", "radix-sort", "Radix Sort",
  ["algorithms", "sorting"], "intermediate",
  {
    timeComplexity: "O(d · (n + k))", spaceComplexity: "O(n + k)",
    description: "Sort integers digit by digit from least significant to most significant.",
    pythonCode: `def counting_sort_by_digit(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    for i in arr:
        index = (i // exp) % 10
        count[index] += 1
    for i in range(1, 10):
        count[i] += count[i - 1]
    for i in range(n - 1, -1, -1):
        index = (arr[i] // exp) % 10
        output[count[index] - 1] = arr[i]
        count[index] -= 1
    for i in range(n):
        arr[i] = output[i]

def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        counting_sort_by_digit(arr, exp)
        exp *= 10
    return arr

# Example
arr = [170, 45, 75, 90, 802, 24, 2, 66]
print(radix_sort(arr))`,
  },
);

export const bucketSortModule = createPlaceholderModule(
  "bucket-sort", "bucket-sort", "Bucket Sort",
  ["algorithms", "sorting"], "intermediate",
  {
    timeComplexity: "O(n + k)", spaceComplexity: "O(n + k)",
    description: "Distribute elements into buckets and sort each bucket individually.",
    pythonCode: `def bucket_sort(arr):
    if not arr:
        return arr
    min_val, max_val = min(arr), max(arr)
    bucket_range = (max_val - min_val) / len(arr) + 1
    buckets = [[] for _ in range(len(arr))]
    for num in arr:
        idx = int((num - min_val) / bucket_range)
        buckets[idx].append(num)
    result = []
    for bucket in buckets:
        result.extend(sorted(bucket))
    return result

# Example
arr = [0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434]
print(bucket_sort(arr))`,
  },
);

export const timSortModule = createPlaceholderModule(
  "tim-sort", "tim-sort", "Tim Sort",
  ["algorithms", "sorting"], "advanced",
  {
    timeComplexity: "O(n log n)", spaceComplexity: "O(n)",
    description: "Hybrid stable algorithm derived from merge sort and insertion sort. Used in Python's sorted().",
    pythonCode: `MIN_MERGE = 32

def insertion_sort(arr, left, right):
    for i in range(left + 1, right + 1):
        key = arr[i]
        j = i - 1
        while j >= left and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key

def merge(arr, left, mid, right):
    left_arr = arr[left:mid + 1]
    right_arr = arr[mid + 1:right + 1]
    i = j = 0
    k = left
    while i < len(left_arr) and j < len(right_arr):
        if left_arr[i] <= right_arr[j]:
            arr[k] = left_arr[i]; i += 1
        else:
            arr[k] = right_arr[j]; j += 1
        k += 1
    while i < len(left_arr):
        arr[k] = left_arr[i]; i += 1; k += 1
    while j < len(right_arr):
        arr[k] = right_arr[j]; j += 1; k += 1

def tim_sort(arr):
    n = len(arr)
    for i in range(0, n, MIN_MERGE):
        insertion_sort(arr, i, min(i + MIN_MERGE - 1, n - 1))
    size = MIN_MERGE
    while size < n:
        for left in range(0, n, 2 * size):
            mid = min(left + size - 1, n - 1)
            right = min(left + 2 * size - 1, n - 1)
            if mid < right:
                merge(arr, left, mid, right)
        size *= 2
    return arr`,
  },
);

export const introSortModule = createPlaceholderModule(
  "intro-sort", "intro-sort", "Intro Sort",
  ["algorithms", "sorting"], "advanced",
  {
    timeComplexity: "O(n log n)", spaceComplexity: "O(log n)",
    description: "Hybrid of quicksort, heapsort, and insertion sort for worst-case O(n log n) guarantee.",
    pythonCode: `import math

def insertion_sort(arr, start, end):
    for i in range(start + 1, end + 1):
        key = arr[i]
        j = i - 1
        while j >= start and arr[j] > key:
            arr[j + 1] = arr[j]; j -= 1
        arr[j + 1] = key

def heapify(arr, n, i, start):
    largest = i
    l, r = 2 * (i - start) + 1 + start, 2 * (i - start) + 2 + start
    if l < start + n and arr[l] > arr[largest]: largest = l
    if r < start + n and arr[r] > arr[largest]: largest = r
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest, start)

def heap_sort(arr, start, end):
    n = end - start + 1
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, start + i, start)
    for i in range(n - 1, 0, -1):
        arr[start], arr[start + i] = arr[start + i], arr[start]
        heapify(arr, i, start, start)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1; arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

def introsort_helper(arr, start, end, max_depth):
    size = end - start + 1
    if size < 16:
        insertion_sort(arr, start, end)
    elif max_depth == 0:
        heap_sort(arr, start, end)
    else:
        pivot = partition(arr, start, end)
        introsort_helper(arr, start, pivot - 1, max_depth - 1)
        introsort_helper(arr, pivot + 1, end, max_depth - 1)

def intro_sort(arr):
    max_depth = 2 * math.floor(math.log2(len(arr)))
    introsort_helper(arr, 0, len(arr) - 1, max_depth)
    return arr`,
  },
);

export const cycleSortModule = createPlaceholderModule(
  "cycle-sort", "cycle-sort", "Cycle Sort",
  ["algorithms", "sorting"], "intermediate",
  {
    timeComplexity: "O(n²)", spaceComplexity: "O(1)",
    description: "Optimal in-place sort that minimizes the number of writes to the original array.",
    pythonCode: `def cycle_sort(arr):
    writes = 0
    for cycle_start in range(0, len(arr) - 1):
        item = arr[cycle_start]
        pos = cycle_start
        for i in range(cycle_start + 1, len(arr)):
            if arr[i] < item:
                pos += 1
        if pos == cycle_start:
            continue
        while item == arr[pos]:
            pos += 1
        arr[pos], item = item, arr[pos]
        writes += 1
        while pos != cycle_start:
            pos = cycle_start
            for i in range(cycle_start + 1, len(arr)):
                if arr[i] < item:
                    pos += 1
            while item == arr[pos]:
                pos += 1
            arr[pos], item = item, arr[pos]
            writes += 1
    return arr, writes

# Example
arr = [1, 8, 3, 9, 10, 10, 2, 4]
sorted_arr, writes = cycle_sort(arr)
print(sorted_arr)   # [1, 2, 3, 4, 8, 9, 10, 10]
print(f"Writes: {writes}")`,
  },
);
