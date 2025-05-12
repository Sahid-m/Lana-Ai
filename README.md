# LANA AI - A Platform to Build, Debug, and Deploy Smart Contracts on Solana Using Natural Language

LANA AI is a platform designed to simplify the process of writing, debugging, and deploying smart contracts on the Solana blockchain. The unique feature of this platform is its ability to generate smart contracts using **natural language prompts**.

### 🚀 **How It Works**

Simply visit our website, sign up or sign in, and type a natural language prompt describing the smart contract you'd like to create. LANA AI will generate the code for you! You will have a VS Code-like editor on the right side for interacting with the code, and a prompt input section on the left where you can continue refining your requests.

Key Features:

- **Reprompting:** If the generated contract has issues or needs modification, you can ask the AI to refine it or fix errors.
- **Debugging:** You can debug the contract by providing additional prompts or changing it yourself.
- **Running Commands:** You can run commands just as you would on your local machine to interact with the code.
- **Context-Aware:** The AI is pre-configured with context for an Anchor project (a framework for Solana), making it easier to generate contract code specifically for Solana.

### ⚡ **Current Status**

- **Platform Features:** MVP (Minimal Viable Product) with capabilities like reprompting, debugging, and creating contracts in response to natural language.
- **Deployment:** Currently, the deployment part is under development, but a **Kubernetes deployment** is coming soon.
- **Inspired by:** The project is heavily inspired by **100xdevs** and **MobileMagic**, and much has been learned from their work.

### 🛠 **How to Set Up**

Follow these steps to get the LANA AI platform running either via Docker or Standalone:

#### 1. **Run Database Docker**

Start the PostgreSQL database Docker container for storing data:

```bash
docker run -p 5432:5432 -d -e POSTGRES_PASSWORD=mysupersecretpassword postgres
```

#### 2. **Build New Coder Server Docker Image**

Build the Docker image for the code server from the provided Dockerfile:

```bash
sudo docker build -f docker/dockerfile.newcoder -t code-server-new .
```

#### 3. **Run the Code Server Docker Container**

Run the newly built Docker image for the code server:

```bash
sudo docker run -it --add-host=host.docker.internal:host-gateway -p 8080:8080 new-code-server
```

#### 4. **Run the Apps**

You can run the application either directly from Docker or by navigating to the corresponding folders and executing the relevant commands.

### 📝 **Contributing**

This project is currently under active development by a second-year student, and while progress may be a bit slow due to exams, there are many exciting features planned! If you would like to contribute or suggest improvements, feel free to open an issue or create a pull request.

---

### Screenshots

1. ![image](https://github.com/user-attachments/assets/2f4d55b5-dab6-41e5-a2a0-3ef36923182e)
2. ![image](https://github.com/user-attachments/assets/991970b0-e0f7-49a2-b19d-8bf22ddda73b)

**Enjoy building with LANA AI!** 🚀
