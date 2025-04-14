**AI-Powered Personalized Learning Platform for Exceptional Learners**

**Overview**

The AI-Powered Personalized Learning Platform is designed to adapt educational content to the unique cognitive needs of exceptional learners, including students with ADHD, dyslexia, dyscalculia, and other learning differences. Using AI-driven assessments and adaptive content recommendations, the platform enhances engagement, comprehension, and accessibility for all students.

**Features**

- AI powered teaching techniques including lesson plans, icebreakers and test crafted speically for dyslexic and dysclaculic students.
- AI-Based Assessment: Analyzes students' cognitive profiles to personalize learning paths.
- Real-Time Feedback & Progress Tracking: Helps teachers and parents monitor student growth.
- Accessibility Features: Supports text-to-speech, font customization, and dyslexia-friendly interfaces.

## Project Structure

The project consists of two main components:
- Frontend: React application
- Backend: FastAPI server

## Prerequisites

Before running the application, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

## Installation and Setup

### Backend Setup

1. Navigate to the backend directory:
cd d:\Amisha\VTech\Capstone\diversemind-ai\Backend

2. Create a virtual environment (optional but recommended):
python -m venv venv

3. Activate the virtual environment:
- Windows:
  ```
  venv\Scripts\activate
  ```
- macOS/Linux:
  ```
  source venv/bin/activate
  ```

4. Install the required dependencies:
pip install -r requirements.txt


5. Create a `.env` file in the Backend directory with your API keys:


6. Start the backend server:
uvicorn app.main:app --reload


### Frontend Setup

1. Navigate to the frontend directory:
cd d:\Amisha\VTech\Capstone\diversemind-ai\Frontend


2. Install the required dependencies:
npm install


3. Start the development server:
npm run dev


4. The application will be available at `http://localhost:3000`
