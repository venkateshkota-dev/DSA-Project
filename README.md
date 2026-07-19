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

