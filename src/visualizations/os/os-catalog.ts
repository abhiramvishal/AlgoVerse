import { createPlaceholderModule } from "@/visualizations/placeholder";

// Process Scheduling
export const fcfsModule = createPlaceholderModule(
  "fcfs", "fcfs", "FCFS Scheduling",
  ["os", "process-scheduling"], "beginner",
);
export const sjfModule = createPlaceholderModule(
  "sjf", "sjf", "Shortest Job First",
  ["os", "process-scheduling"], "beginner",
);
export const srtfModule = createPlaceholderModule(
  "srtf", "srtf", "Shortest Remaining Time First",
  ["os", "process-scheduling"], "intermediate",
);
export const roundRobinModule = createPlaceholderModule(
  "round-robin", "round-robin", "Round Robin Scheduling",
  ["os", "process-scheduling"], "beginner",
);
export const prioritySchedulingModule = createPlaceholderModule(
  "priority-scheduling", "priority-scheduling", "Priority Scheduling",
  ["os", "process-scheduling"], "intermediate",
);
export const multilevelQueueModule = createPlaceholderModule(
  "multilevel-queue", "multilevel-queue", "Multilevel Queue",
  ["os", "process-scheduling"], "intermediate",
);
export const multilevelFeedbackModule = createPlaceholderModule(
  "multilevel-feedback", "multilevel-feedback", "Multilevel Feedback Queue",
  ["os", "process-scheduling"], "advanced",
);

// Memory Management
export const pagingModule = createPlaceholderModule(
  "paging", "paging", "Paging",
  ["os", "memory-management"], "intermediate",
);
export const segmentationModule = createPlaceholderModule(
  "segmentation", "segmentation", "Segmentation",
  ["os", "memory-management"], "intermediate",
);
export const virtualMemoryModule = createPlaceholderModule(
  "virtual-memory", "virtual-memory", "Virtual Memory",
  ["os", "memory-management"], "intermediate",
);
export const buddySystemModule = createPlaceholderModule(
  "buddy-system", "buddy-system", "Buddy System",
  ["os", "memory-management"], "advanced",
);

// Page Replacement
export const fifoPageModule = createPlaceholderModule(
  "fifo-page", "fifo-page", "FIFO Page Replacement",
  ["os", "page-replacement"], "beginner",
);
export const lruPageModule = createPlaceholderModule(
  "lru-page", "lru-page", "LRU Page Replacement",
  ["os", "page-replacement"], "intermediate",
);
export const optimalPageModule = createPlaceholderModule(
  "optimal-page", "optimal-page", "Optimal Page Replacement",
  ["os", "page-replacement"], "intermediate",
);
export const clockPageModule = createPlaceholderModule(
  "clock-page", "clock-page", "Clock Algorithm",
  ["os", "page-replacement"], "intermediate",
);
export const nfuPageModule = createPlaceholderModule(
  "nfu-page", "nfu-page", "NFU Page Replacement",
  ["os", "page-replacement"], "intermediate",
);

// Deadlock
export const deadlockDetectionModule = createPlaceholderModule(
  "deadlock-detection", "deadlock-detection", "Deadlock Detection",
  ["os", "deadlock"], "intermediate",
);
export const bankersAlgorithmModule = createPlaceholderModule(
  "bankers-algorithm", "bankers-algorithm", "Banker's Algorithm",
  ["os", "deadlock"], "intermediate",
);
export const deadlockPreventionModule = createPlaceholderModule(
  "deadlock-prevention", "deadlock-prevention", "Deadlock Prevention",
  ["os", "deadlock"], "intermediate",
);
export const deadlockRecoveryModule = createPlaceholderModule(
  "deadlock-recovery", "deadlock-recovery", "Deadlock Recovery",
  ["os", "deadlock"], "intermediate",
);

// Disk Scheduling
export const fcfsDiskModule = createPlaceholderModule(
  "fcfs-disk", "fcfs-disk", "FCFS Disk Scheduling",
  ["os", "disk-scheduling"], "beginner",
);
export const sstfModule = createPlaceholderModule(
  "sstf", "sstf", "SSTF Disk Scheduling",
  ["os", "disk-scheduling"], "beginner",
);
export const scanDiskModule = createPlaceholderModule(
  "scan-disk", "scan-disk", "SCAN (Elevator) Scheduling",
  ["os", "disk-scheduling"], "intermediate",
);
export const cScanModule = createPlaceholderModule(
  "c-scan", "c-scan", "C-SCAN Disk Scheduling",
  ["os", "disk-scheduling"], "intermediate",
);
export const lookDiskModule = createPlaceholderModule(
  "look-disk", "look-disk", "LOOK Disk Scheduling",
  ["os", "disk-scheduling"], "intermediate",
);

// Synchronization
export const mutexModule = createPlaceholderModule(
  "mutex", "mutex", "Mutex",
  ["os", "synchronization"], "beginner",
);
export const semaphoreModule = createPlaceholderModule(
  "semaphore", "semaphore", "Semaphore",
  ["os", "synchronization"], "intermediate",
);
export const monitorModule = createPlaceholderModule(
  "monitor", "monitor", "Monitor",
  ["os", "synchronization"], "intermediate",
);
export const producerConsumerModule = createPlaceholderModule(
  "producer-consumer", "producer-consumer", "Producer-Consumer Problem",
  ["os", "synchronization"], "intermediate",
);
export const readersWritersModule = createPlaceholderModule(
  "readers-writers", "readers-writers", "Readers-Writers Problem",
  ["os", "synchronization"], "intermediate",
);
export const diningPhilosophersModule = createPlaceholderModule(
  "dining-philosophers", "dining-philosophers", "Dining Philosophers",
  ["os", "synchronization"], "advanced",
);
