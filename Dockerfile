# Use AWS Lambda's official Node.js image
FROM node:18


# Set working directory
WORKDIR ./FormBackend

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy application code
COPY . .

# Command to run Lambda function
CMD ["index"]