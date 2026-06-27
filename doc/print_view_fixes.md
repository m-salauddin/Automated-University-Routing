# Print Layout Fixes in University Routine Views

This document provides a detailed breakdown of the print view issues identified in the university routine pages (Student Routine, Teacher/Own Routine, and Routine Entries) and how they were fully resolved.

---

## 1. BREAK Column Layout Adjustments

### The Issues
- **Text Crowding**: When there are no classes scheduled during the break slot, the break column is collapsed into a narrow column (`print:w-6` / `24px`). In this narrow column, the word **"BREAK"** is rotated `-90 degrees`, which looked too large and crowded at the default print font size (`9.5px`).
- **Cluttered Spoon/Utensils Icons**: The print view rendered a `Utensils` icon (fork and spoon) inside the narrow break cells, which appeared distorted and cluttered when rotated or scaled down.

### The Fixes
1. **Break Text Sizing**:
   - Introduced a new helper class `.print-break-text-no-class` specifically for the rotated text:
     ```css
     .print-break-text-no-class {
       font-size: 7.5px !important;
     }
     ```
   - Applied this class conditionally only to the header column when there are no classes in the break slot (`!hasClass`).
2. **Icon Removal**:
   - Omitted the print-only utensils icon `div` from the cells when no session is scheduled:
     ```tsx
     // Removed the following block in print mode:
     <div className="hidden print:flex h-full w-full items-center justify-center relative z-10">
       <Utensils className="w-3 h-3 text-black" />
     </div>
     ```
   - This leaves the cells completely clean and blank, matching the user's requirements.

---

## 2. Thick Outer Page Border Issue

### The Issue
During print previews, a thick solid black frame/border appeared around the entire page area for the Teacher's Own Routine and Admin Routine views. This border did not appear in the Student Routine view.

### Root Cause Analysis
1. **Component-Scoped Styles**:
   - In `student-routine/index.tsx`, print styles were declared using `<style jsx global>{`...`}</style>`.
   - In `own-routine/index.tsx` and `routine-entries/index.tsx`, styles were declared using `<style>{`...`}</style>`.
   - Next.js/styled-jsx scopes standard `<style>` tags to the local component by appending unique class hashes. Thus, global resets like `* { border: none !important; }` could **not** reach parent/ancestor HTML elements outside the component (such as the main layout frame wrapper `[data-slot="sidebar-inset"]`).
2. **Tailwind Border Variable (`--border`)**:
   - The student routine view explicitly overrides Tailwind's border color CSS variable to white during printing:
     ```css
     --border: 0 0% 100% !important;
     ```
   - The teacher's routine view did not define this reset, causing components inside the layout that refer to `border-border` to keep rendering with their default dark borders.
3. **Outermost Div Sizing**:
   - The root `<motion.div>` in the teacher's view lacked print sizing utility classes like `print:max-w-none print:w-full print:bg-white print:text-black`, preventing page-level container dimensions from resetting correctly.

### The Fixes
1. **Global Stylesheet Scopes**:
   - Modified both `own-routine/index.tsx` and `routine-entries/index.tsx` to use `<style jsx global>` so that print overrides target the root HTML body, sidebar containers, and theme variables globally.
2. **Exact Style Block Synchronization**:
   - Replaced the print style block in the other routine pages to be 100% identical to the student routine view, ensuring that:
     - `--border` is set to white.
     - `* { border: none !important; }` successfully strips all layout containers of borders.
     - Table and table cells are the only elements that explicitly restore borders (`table, th, td { border: 1px solid black !important; }`).
3. **Outer Wrapper Wrapper Updates**:
   - Standardized the wrapper `<motion.div>` class across all files to:
     ```tsx
     className="w-full font-lexend max-w-full overflow-x-hidden mx-auto p-5 space-y-4 print:p-0 print:m-0 print:max-w-none print:w-full print:bg-white print:text-black print:overflow-visible"
     ```

---

## 3. Blank/Multi-page Print Overflow & Page Centering

### The Issue
- Routine print views were generating a blank second page, even though the content was compact enough to fit entirely on a single page.
- When container height was set to `auto` or when margins were applied, the content failed to align exactly at the vertical and horizontal center of the page.

### Root Cause Analysis
- The parent container `.print-page-container` had its print height forced to `100vh !important`. Since browsers inject default page margins (top + bottom of `5mm` each, totaling `10mm`), forcing the container height to `100vh` exceeded the printable region, generating a blank second page.
- If height is set to `auto`, the flexbox centering rules (`justify-content: center`, `align-items: center`) no longer align elements vertically because the flex container collapses to fit the content size.

### The Fixes
- Set the print height of `.print-page-container` to `calc(100vh - 10mm) !important` and cleared internal padding (`padding: 0 !important`).
- This makes the container match the height of the printable page area exactly, allowing the flexbox properties to center the routine layout horizontally and vertically while preventing any blank page spillover:
  ```css
  @media print {
    .print-page-container {
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: center !important;
      height: calc(100vh - 10mm) !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      box-sizing: border-box !important;
      padding: 0 !important;
    }
  }
  ```

---

## Files Updated

- **Student Routine Module**: 
  - [student-routine/index.tsx](file:///c:/Users/Shuvo%20Debnath/VsCode/University%20Project%20Frontend/Frontend/src/components/modules/dashboard/student-routine/index.tsx) *(Reduced break text, removed utensils, centered container vertically/horizontally in print)*
- **Teacher Own Routine Module**:
  - [own-routine/index.tsx](file:///c:/Users/Shuvo%20Debnath/VsCode/University%20Project%20Frontend/Frontend/src/components/modules/dashboard/own-routine/index.tsx) *(Reduced break text, removed utensils, converted style scope to jsx global, synced print CSS & container wrapper classes, centered container vertically/horizontally in print)*
- **Admin/Entries Routine Module**:
  - [routine-entries/index.tsx](file:///c:/Users/Shuvo%20Debnath/VsCode/University%20Project%20Frontend/Frontend/src/components/modules/dashboard/routine-entries/index.tsx) *(Converted style scope to jsx global, synced print CSS & container wrapper classes, centered container vertically/horizontally in print)*
- **Department Routine Module**:
  - [department-routine/index.tsx](file:///c:/Users/Shuvo%20Debnath/VsCode/University%20Project%20Frontend/Frontend/src/components/modules/dashboard/department-routine/index.tsx) *(Added 'All Semesters' view option, removed print border layout, enabled print button for teachers, formatted layout for print-centering and break elements)*
