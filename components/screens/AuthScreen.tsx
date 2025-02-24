import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../utils/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { saveUserToFireStore } from "@/utils/FireStore";

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!-#%*?& ]{8,}$/;

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+\.[a-zA-Z]+$/;

  useEffect(() => {
    validateFields();
  }, [firstName, lastName, email, password, confirmPassword, isLogin]);

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, {
          displayName: `${firstName} ${lastName}`,
        });
        saveUserToFireStore(firstName, lastName);
      }
    } catch (error: any) {
      if (error.message.includes("auth/invalid-credential")) {
        setError("Email ou mot de passe incorrecte !");
        return;
      }
      if (error.message.includes("auth/email-already-in-use")) {
        setError("Email déjà associé à un compte !");
        return;
      }
      console.log(error);
      setError(error.message);
    }
  };

  const validateFields = () => {
    let errorMessage = "";
    if (!isLogin) {
      if (firstName === "") {
        errorMessage = "Le champ prénom est incorrect!";
      } else if (!emailRegex.test(email)) {
        errorMessage = "Le champ email est incorrect!";
      } else if (!passwordRegex.test(password)) {
        errorMessage =
          "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.";
      } else if (confirmPassword !== password) {
        errorMessage = "Les mots de passe saisis sont différents !";
      }
    } else {
      if (!emailRegex.test(email)) {
        errorMessage = "Le champ email est incorrect!";
      }
    }
    setError(errorMessage);
    setIsFormValid(errorMessage === "");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        {!isLogin && (
          <>
            <View style={styles.inputContainer}>
              <Ionicons
                name="medical"
                size={7}
                color="red"
                style={styles.requiredIcon}
              ></Ionicons>
              <Ionicons
                name="person-outline"
                size={24}
                color="#665b41"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Prénom"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  validateFields();
                }}
                placeholderTextColor="#665b41"
                autoCapitalize="words"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="medical"
                size={7}
                color="white"
                style={styles.requiredIcon}
              ></Ionicons>
              <Ionicons
                name="person-outline"
                size={24}
                color="#665b41"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nom"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  validateFields();
                }}
                placeholderTextColor="#665b41"
                autoCapitalize="characters"
              />
            </View>
          </>
        )}
        <View style={styles.inputContainer}>
          <Ionicons
            name="medical"
            size={7}
            color="red"
            style={styles.requiredIcon}
          ></Ionicons>
          <Ionicons
            name="mail-outline"
            size={24}
            color="#665b41"
            style={styles.icon}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              validateFields();
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#665b41"
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="medical"
            size={7}
            color="red"
            style={styles.requiredIcon}
          ></Ionicons>
          <Ionicons
            name="lock-closed-outline"
            size={24}
            color="#665b41"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#665b41"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              validateFields();
            }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={24}
              color="#665b41"
            />
          </TouchableOpacity>
        </View>
        {!isLogin && (
          <View style={styles.inputContainer}>
            <Ionicons
              name="medical"
              size={7}
              color="red"
              style={styles.requiredIcon}
            ></Ionicons>
            <Ionicons
              name="lock-closed-outline"
              size={24}
              color="#665b41"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor="#665b41"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                validateFields();
              }}
              secureTextEntry={!showPassword}
            />
          </View>
        )}
        <TouchableOpacity
          style={[styles.button, { opacity: isFormValid ? 1 : 0.3 }]}
          onPress={handleAuth}
          disabled={!isFormValid}
        >
          <Text style={styles.buttonText}>
            {isLogin ? "Se connecter" : "S'inscrire"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin
              ? "Pas de compte ? S'inscrire"
              : "Déjà un compte ? Se connecter"}
          </Text>
        </TouchableOpacity>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#665b41",
  },
  formContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderColor: "##665b41",
    borderWidth: 1,
    borderRadius: 5,
  },
  icon: {
    padding: 10,
  },
  requiredIcon: {
    paddingLeft: 5,
    paddingTop: 10,
    alignSelf: "flex-start",
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchText: {
    marginTop: 15,
    color: "#4CAF50",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});
