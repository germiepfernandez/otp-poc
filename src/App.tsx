import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
	AuthenticationDetails,
	CognitoUser,
	CognitoUserAttribute,
	CognitoUserPool,
} from "amazon-cognito-identity-js";

function App() {
	const password = "Test1234.";
	const [mode, setMode] = useState<"signin" | "otp" | "loggedin">("signin");
	const [otp, setOTP] = useState<string>("");
	const [data, setData] = useState<string | null>(null);
	const [user, setUserDetails] = useState<{
		email: string;
		phoneNumber: string;
	}>({ email: "", phoneNumber: "" });

	const userPool = useMemo(() => {
		var poolData = {
			UserPoolId: process.env.REACT_APP_USER_POOL_ID ?? "",
			ClientId: process.env.REACT_APP_CLIENT_ID ?? "",
		};

		return new CognitoUserPool(poolData);
	}, []);

	const handleSignIn = () => {
		var attributeList = [];

		const attributePhoneNumber = new CognitoUserAttribute({
			Name: "phone_number",
			Value: user.phoneNumber,
		});
		const attributeEmail = new CognitoUserAttribute({
			Name: "email",
			Value: user.email,
		});

		attributeList.push(attributeEmail);
		attributeList.push(attributePhoneNumber);

		userPool.signUp(
			user.phoneNumber,
			password,
			attributeList,
			[],
			function (err, result) {
				if (err) {
					alert(err.message || JSON.stringify(err));
					return;
				}
				// var cognitoUser = result?.user;
				setMode("otp");
			}
		);
	};

	const handleOTPSubmit = () => {
		var userData = {
			Username: user.phoneNumber,
			Pool: userPool,
		};

		var cognitoUser = new CognitoUser(userData);
		cognitoUser.confirmRegistration(otp, true, function (err, result) {
			if (err) {
				alert(err.message || JSON.stringify(err));
				return;
			}

			setMode("loggedin");
			getUser();
		});
	};

	const getUser = () => {
		const userData = {
			Username: user.phoneNumber,
			Pool: userPool,
		};
		const authenticationDetails = new AuthenticationDetails({
			Username: user.phoneNumber,
			Password: password,
		});
		const cognitoUser = new CognitoUser(userData);
		cognitoUser.authenticateUser(authenticationDetails, {
			onSuccess: function (result) {
				console.log(result.getAccessToken());
				setData(result.getAccessToken().getJwtToken());
			},
			onFailure: function (err) {
				console.error(err);
				alert(err.message || JSON.stringify(err));
			},
		});
	};

	return (
		<div className="App">
			<header className="App-header">
				{mode === "signin" && (
					<>
						<input
							type="email"
							value={user.email}
							onChange={(e) =>
								setUserDetails((prev) => {
									return {
										...prev,
										email: e.target
											.value,
									};
								})
							}
						/>
						<br />
						<input
							type="text"
							value={user.phoneNumber}
							onChange={(e) =>
								setUserDetails((prev) => {
									return {
										...prev,
										phoneNumber:
											e.target
												.value,
									};
								})
							}
						/>
						<br />
						<button onClick={handleSignIn}>
							Sign in
						</button>
					</>
				)}
				{mode === "otp" && (
					<>
						<input
							type="text"
							value={otp}
							onChange={(e) =>
								setOTP(e.target.value)
							}
						/>
						<br />
						<button onClick={handleOTPSubmit}>
							Submit
						</button>
					</>
				)}
				{mode === "loggedin" && <p>{data}</p>}
			</header>
		</div>
	);
}

export default App;
