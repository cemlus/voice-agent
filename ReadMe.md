<!-- write me a read me below telling me about the project that i am building, its basically a custom voice cloning interface where users upload their voice and i use LMNT to clone their voice and turn it into an actionable agent's voice. their audio files will be stored on the backend and then fed to the LMNT api from where we will recieve the agent voice id and details as a result which we'll store in another table to hit the LMNT api again when we have to use that agent again -->
# Custom Voice Cloning Interface 🗣   ️
Welcome to the Custom Voice Cloning Interface project! This innovative application allows users to upload their own voice recordings, which are then processed using the LMNT (Language Model for Natural Text) technology to create a personalized, actionable agent's voice.

## Project Overview
This project aims to provide a user-friendly interface for voice cloning, enabling individuals to create a digital representation of their voice. The cloned voice can be used in various applications, such as virtual assistants, customer service bots, and more, enhancing user interaction with technology.

## Features
- **Voice Upload**: Users can easily upload their voice recordings through a simple interface.
- **Voice Cloning**: The uploaded audio files are processed using the LMNT API to clone the user's voice.
- **Agent Voice Creation**: The cloned voice is transformed into an actionable agent's voice, which can be used in various applications via the LMNT API.
- **Backend Storage**: All audio files and cloned voice details are securely stored in the backend, ensuring easy retrieval and management.
- **Agent Management**: The system maintains a database of agent voice IDs and details, allowing for efficient access and reuse of cloned voices.

## How It Works
1. **User Interaction**: Users upload their voice recordings through the interface.
2. **Processing**: The audio files are sent to the LMNT API, which processes the recordings to create a cloned voice.
3. **Storage**: The cloned voice details, including the agent voice ID, are stored in a dedicated database table for future reference.
4. **Retrieval**: When the agent's voice is needed, the system retrieves the corresponding details from the database and interacts with the LMNT API to use the cloned voice.
5. **Actionable Agent**: The cloned voice can be utilized in various applications, providing a personalized user experience.

## Getting Started
To get started with the Custom Voice Cloning Interface, follow these steps:
1. Clone the repository to your local machine.
2. Install the necessary dependencies using your preferred package manager.
3. Set up the backend to handle audio file storage and interaction with the LMNT API.
4. Launch the application and start uploading your voice recordings.
