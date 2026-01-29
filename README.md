
# Cycle Goal Tracker 📅

A powerful goal management app designed to break down your annual targets into **36 cycles of 10 days each**—helping you stay focused, track progress, and never miss a deadline with smart reminders!

## 🌟 Core Features

### 1. Cycle Calendar System

- Automatically generates a **36-cycle calendar** (10 days per cycle, covering 360 days of goal planning)

- Visualize completion status of each cycle at a glance (progress bar, color-coded indicators)

- Quick navigation between cycles to review past performance or plan ahead

### 2. Goal & Task Management

- Set specific goals for each 10-day cycle (e.g., "Complete 5 project tasks" or "Read 2 books")

- Break down cycle goals into **daily actionable tasks** with detailed descriptions

- Mark tasks as completed/in-progress/pending to track daily progress

- Edit or update goals/tasks anytime to adapt to changing plans

### 3. Smart Reminders & Alarms

- Customizable reminders based on pre-filled goal/task content (e.g., "Remind me to finish Task X every 3 days")

- Built-in alarm functionality to ensure you never miss critical deadlines

- Flexible reminder timing (set specific times, repeat intervals, or one-time alerts)

### 4. Multilingual Support

- Seamless language switching to adapt to your preferred language

- Currently supports [English, 中文] (easily extendable to more languages)

## 🚀 How It Works

1. **Initialize Your Cycle Calendar**: The app automatically creates 36 cycles (10 days each) upon first launch.

2. **Set Cycle Goals**: For each cycle, define your main objective (e.g., "Learn Python basics") and set completion criteria.

3. **Break Down Daily Tasks**: Add specific tasks to each day of the cycle (e.g., "Watch 2 tutorials" on Day 1).

4. **Track Progress**: Mark tasks as completed to update the cycle’s progress status—visual indicators help you stay on track.

5. **Enable Reminders**: Set up alarms for important tasks or cycle deadlines (e.g., "Remind me to review on Day 10").

6. **Switch Languages**: Use the settings menu to toggle between supported languages anytime.

## 🛠️ Tech Stack

- [Framework/Language]: [e.g., Flutter, React Native, Swift, Kotlin] (replace with your actual tech stack)

- Local Storage: [e.g., SQLite, Hive, SharedPreferences] (for saving cycles, goals, tasks, and settings)

- Notification System: [e.g., Firebase Cloud Messaging, Local Notifications API] (for reminders/alarms)

- Internationalization: [e.g., i18n, intl package] (for multilingual support)

## 📱 Screenshots (Optional)

Add screenshots here to showcase the app’s UI (e.g., cycle calendar view, goal setup, task list, reminder settings). Example:

```Markdown

| Cycle Calendar | Goal Setup | Task List | Reminder Settings |
|----------------|------------|-----------|-------------------|
| [Screenshot 1] | [Screenshot 2] | [Screenshot 3] | [Screenshot 4] |
```

## 📥 Installation

1. Clone the repository:

    ```Bash
    
    git clone https://github.com/[your-username]/cycle-goal-tracker.git
    ```

2. Navigate to the project directory:

    ```Bash
    
    cd cycle-goal-tracker
    ```

3. Install dependencies:

    ```Bash
    
    [your package manager command, e.g., npm install, flutter pub get]
    ```

4. Run the app:

    ```Bash
    
    [your run command, e.g., npm start, flutter run]
    ```

## 🔧 Customization

- **Adjust Cycle Length**: Modify the `cycleDuration` constant in `config.dart` (or equivalent file) to change the cycle length (default: 10 days).

- **Add Languages**: Extend the `i18n` folder with translation files for new languages (follow the existing format).

- **Modify Reminder Logic**: Update the `notification_service.dart` (or equivalent) to adjust reminder frequency, sound, or behavior.

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-feature`)

3. Commit your changes (`git commit -m 'Add some amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)

5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

If you have any questions, suggestions, or issues, feel free to reach out:

- GitHub: [@your-username](https://github.com/%5Byour-username%5D)

- Email: [[your-email@example.com](mailto:your-email@example.com)]
