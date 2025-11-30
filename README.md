# Automated University Routine Management

A comprehensive, role-based web application designed to provide hassle-free, automated routine generation for the entire university. Unlike department-specific solutions, this system manages the complex scheduling needs of the whole institution, handling department batches, time slots, and courses to ensure conflict-free routine generation.

## 🎯 Project Goal

The primary goal is to automate the generation of academic routines, minimizing manual effort and eliminating conflicts. The system serves three main roles: **Admin**, **Teacher**, and **Student**, each with tailored features to visualize workload, manage schedules, and access academic information.

## 🌐 Live Demo

Experience the application live:

-   **Frontend**: [https://automated-university-routine.vercel.app/](https://automated-university-routine.vercel.app/)
-   **Backend Admin Panel**: [https://routineproject-s6dh.onrender.com/admin/](https://routineproject-s6dh.onrender.com/admin/)

## 🚀 Key Features by Role

### 🅰️ Admin Panel
The Admin panel is the command center of the application, featuring **6 main routes** to manage the entire system.

1.  **Analytics (Global)**
    *   Provides a bird's-eye view of the entire university's academic status.
    *   Visualizes **Workload**, **Room Usage**, **Class Credits**, and a breakdown of **Lab vs. Theory classes**.
    *   Aggregates data across all teacher and student panels.

2.  **Curriculum (Common Route)**
    *   Accessible by **Admins, Teachers, and Students**.
    *   Displays a comprehensive list of all courses in a table format.
    *   Includes details like **Course Codes**, **Credits**, **Marks**, and **Type** (Lab/Theory).
    *   Features advanced **filtering** to help users find specific courses.
    *   Includes a **Print** feature for offline access.

3.  **Courses**
    *   Allows Admins to **create courses** and assign them to specific teachers.
    *   Enables selection of rooms, departments, and other logistical details during course creation.

4.  **Academic Config**
    *   Manages the foundational data of the institution.
    *   Perform **CRUD operations** for **Departments**, **Semesters**, and **Time Slots**.

5.  **Routine Entries**
    *   **Core Feature**: Generate new routines with **zero conflicts** (collision detection).
    *   View routines for all departments with **Semester filters**.
    *   Search for specific teachers to see their classes for a particular semester.
    *   **Lock/Unlock Mechanism**: Admins can lock the routine generation to prevent accidental overwrites. Unlocking requires a confirmation (typing "unlock" in a modal).

6.  **Users**
    *   Perform **CRUD operations** for user accounts.
    *   Filter users by role: **Admin**, **Teacher**, or **Student**.
    *   All tables include **pagination** for easy navigation.

---

### 👨‍🏫 Teacher Panel
The Teacher panel focuses on personal workload management and schedule visibility, consisting of **3 main routes**.

1.  **Analytics (Personal)**
    *   Displays stats and workload specific to the logged-in teacher.
    *   Helps teachers visualize their schedule distribution.

2.  **Curriculum (Common Route)**
    *   Same access and features as the Admin panel (View all courses, filter, print).

3.  **Own Routine**
    *   View assigned classes with detailed info: **Date**, **Time Slot**, **Batch**, **Course Name**, and **Room No**.
    *   **Class Cancellation**: Teachers can mark a class as "Off" if they cannot attend.
        *   Requires a valid reason (max 100 chars).
        *   This status is reflected in the Admin's *Routine Entries* and the Student's *Routine* with a **red mark**.
        *   Clicking the mark reveals the reason.
    *   **Reactivate Class**: Teachers can reactivate a cancelled class if plans change.

---

### 👨‍ Student Panel
The Student panel is designed to keep students informed about their classes and schedule, featuring **3 main routes**.

1.  **Analytics (Personal)**
    *   Displays stats and workload specific to the student's enrolled courses.

2.  **Curriculum (Common Route)**
    *   Same access and features as the Admin panel (View all courses, filter, print).

3.  **Student Routine**
    *   View the routine specific to their **Department** and **Semester**.
    *   **Class Off Notifications**: Students can see if a teacher has cancelled a class (marked in red).
    *   View detailed reasoning for class cancellations.

## 🛡️ Security & Usability

### Route Security
-   **Role-Based Access Control (RBAC)**: All routes are secured with strict role-based checks. Users attempting to access unauthorized routes are redirected or shown error restrictions.
-   **Error Handling**: Comprehensive error restrictions are in place to prevent unauthorized access and ensure data integrity.

### Enhanced Usability
-   **Pagination**: All pages featuring data tables are equipped with pagination to handle large datasets efficiently.
-   **Print View**: Every page with a table includes a print-friendly view, allowing users to easily export or print data for offline use.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
-   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
-   **Form Handling**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Drag & Drop**: [dnd-kit](https://dndkit.com/)
-   **Icons**: [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/)
-   **Charts**: [Recharts](https://recharts.org/)
-   **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF), [html2canvas](https://html2canvas.hertzen.com/)
-   **Date Handling**: [date-fns](https://date-fns.org/)

### Backend
-   **Framework**: [Django](https://www.djangoproject.com/)
-   **API**: [Django REST Framework](https://www.django-rest-framework.org/)
-   **Authentication**: [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
-   **Database**: PostgreSQL (via psycopg2)
-   **Data Processing**: [NumPy](https://numpy.org/), [Matplotlib](https://matplotlib.org/)
-   **Utilities**: [Django Filter](https://django-filter.readthedocs.io/), [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)

## 🏁 Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [Bun](https://bun.sh/) (Recommended) or npm/yarn/pnpm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/m-salauddin/Automated-University-Routing.git
    cd automated-university-routing
    ```

2.  **Install dependencies**
    ```bash
    bun install
    # or
    npm install
    ```

3.  **Set up environment variables**
    Create a `.env` file in the root directory and add necessary environment variables (refer to `.env.example` if available).

### Running the Application

Start the development server:

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router pages and layouts
│   ├── (WithDashbordLayout)/ # Routes with the dashboard layout
│   ├── login/            # Authentication pages
│   └── ...
├── components/           # Reusable UI components
│   ├── ui/               # Shadcn UI primitives
│   ├── modules/          # Feature-specific components
│   └── ...
├── services/             # API services and data fetching
├── store/                # Redux store configuration
├── lib/                  # Utility functions and libraries
├── hooks/                # Custom React hooks
└── assets/               # Static assets (images, icons)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
