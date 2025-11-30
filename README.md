# Automated University Routine Management

A modern, comprehensive web application designed to streamline university routine management, course scheduling, and academic administration. Built with Next.js 15, TypeScript, and a focus on a premium user experience.

## 🚀 Features

### 📊 Dashboard
-   **Centralized Hub**: Get a bird's-eye view of academic activities, upcoming classes, and important notices.
-   **Analytics**: Visual insights into student attendance, course completion, and resource utilization.

### 📅 Routine Management
-   **Interactive Schedule**: Drag-and-drop interface for managing class routines.
-   **Personal & Student Views**: Dedicated views for both faculty (own routine) and students.
-   **Time Slots**: Flexible time slot configuration.

### 📚 Course & Curriculum
-   **Course Management**: Create, update, and manage university courses.
-   **Curriculum Planning**: Organize syllabi and academic requirements.
-   **Department Management**: Handle department-specific data and settings.

### 🛠️ Administrative Tools
-   **User Management**: Manage student and faculty profiles.
-   **Class Off Management**: Efficiently handle class cancellations and rescheduling.
-   **Semester Planning**: Manage semester dates and academic calendars.

### 🎨 User Experience
-   **Modern UI**: Built with Shadcn UI and Tailwind CSS for a sleek, accessible design.
-   **Dark Mode**: Fully supported dark mode for comfortable viewing.
-   **Responsive Design**: Optimized for all devices, from desktops to mobile phones.

## 🛠️ Tech Stack

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
