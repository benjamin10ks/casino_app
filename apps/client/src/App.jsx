import Router from "./router";
import { SocketProvider } from "./contexts/SocketContext";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
