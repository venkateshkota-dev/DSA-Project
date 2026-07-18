# CineBook - DSA-First Movie Booking System

CineBook is a production-quality full-stack movie booking system designed to showcase the practical application and interactive visualization of **Data Structures and Algorithms (DSA)** in a real-world software system.

Rather than treating computer science algorithms as abstract theories or backend implementation details, the entire booking pipeline of CineBook is built around them. The highlight of the project is a dedicated **Algorithms Dashboard** and a **Benchmarking Suite** that steps through execution lines, prints visual traces, and graphs runtime statistics.

---

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS v3, Framer Motion
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB (via Mongoose), with an automatic, transparent **In-Memory Database Fallback** if MongoDB is unreachable (ensuring zero-install offline portability for evaluations).

---

## 📂 Project Structure

```text
/ (Workspace Root)
├── DSA/                      # Unified Algorithm Library (Strictly Modular)
│   ├── Graphs/               # Graph representations, Dijkstra's & A* Search
│   ├── Trees/                # Hierarchical Binary Trees and BST indices
│   ├── Searching/            # Sequential Linear Search & halving Binary Search
│   ├── Sorting/              # Stable Merge Sort, in-place Quick & Heap Sorts
│   ├── Heap/                 # Min-Heap, Max-Heap, and Priority Queue
│   ├── Stack/                # Undo Seating Selection Stack
│   ├── Queue/                # Waiting Request Queue Simulator
│   ├── Hashing/              # Constant-Time O(1) Booking Verification Hash Map
│   ├── Greedy/               # Center-Closeness Seat Allocator
│   ├── Backtracking/         # Adjacent Seating Combinations Constraint Solver
│   ├── Concurrency/          # Async Promise Locks (Mutex and Semaphore)
│   └── Visualizer/           # Generator Player and Micro-Benchmarking Suite
├── client/                   # React Web App (Port 5173)
├── server/                   # Express REST API (Port 5000)
└── README.md
```

> [!IMPORTANT]
> **No Algorithm Duplication:**
> Both the frontend visualizer panels and the backend transaction APIs import directly from the shared `/DSA` directory. No algorithmic logic resides inside React components or Express route handlers.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher)
- Optional: Local MongoDB instance running on `mongodb://localhost:27017` (the backend will gracefully fall back to an in-memory DB seed if unreachable).

### Quick Start (Dev Server)

To install all dependencies across the monorepo workspaces and spin up both the Vite React application and the Express API server concurrently:

1. Clone or navigate to the workspace directory.
2. Install dependencies:
   ```bash
   npm run install:all
   ```
3. Run the development environment:
   ```bash
   npm run dev
   ```
4. Access the web interface at: **`http://localhost:5173`**
5. Execute unit tests across all workspaces:
   ```bash
   npm run test
   ```

---

## 🎓 Evaluator Viva Q&A Guide

Here are 5 standard Viva Voce questions examiners ask during project defenses:

1. **Q: How does the Concurrency Sandbox demonstrate the difference between Mutex and Semaphore?**
   - **A:** The *Mutex* is a mutual exclusion lock (capacity = 1) that serializes seat checkout requests. When 5 requests arrive concurrently, only 1 acquires the lock, validates availability, books the seat, and releases it. The other 4 read that the seat is now booked and fail. The *Semaphore* controls connection slots (capacity = 2). It allows 2 checkouts to proceed simultaneously, queueing the rest, but without a Mutex inside those slots, the 2 active checkouts still race against each other, demonstrating that Semaphore controls throughput limits while Mutex controls atomic resource locks.

2. **Q: Why does A* Search explore fewer nodes than Dijkstra to find the nearest theatre?**
   - **A:** Dijkstra explores in all directions blindly, relaxing edges based on path cost $g(n)$ alone. A* leverages an admissible heuristic $h(n)$ (Euclidean coordinate distance to destination). It prioritizes node evaluation based on $f(n) = g(n) + h(n)$, pruning nodes in directions opposite to the destination theatre.

3. **Q: How do you achieve step-by-step backward and forward execution in the visualizer?**
   - **A:** All algorithms are implemented using ES6 **generator functions** (`function*`). The generator yields state snapshot objects (variables, heaps, visited lists) at critical breakpoints. The `AlgorithmPlayer` steps forward by calling `.next()`, caching every yielded step in an array. To step backward, it retrieves the previous snapshot from the cached array history, avoiding re-running the generator.

4. **Q: How is the Undo Seat Selection stack designed?**
   - **A:** As users click available seats, the coordinates are pushed to our custom `UndoSeatSelection` stack. Clicking the Undo button pops the last coordinate from the stack, allowing constant-time $O(1)$ selection history reversal.

5. **Q: What is the purpose of the Custom Hash Map in ticket verification?**
   - **A:** Real-world validation gates must verify booking confirmation IDs instantly. Rather than running linear scans or database lookups, the gate verification queries a custom `BookingHashMap` index. Keys are hashed, mapped to buckets, and searched in $O(1)$ average time, resolving collisions via chaining.
