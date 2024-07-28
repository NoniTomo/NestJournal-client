import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <>
      <Box>О приложении</Box>
      <Button onClick={navigate("./main")}></Button>
    </>
  );
}
