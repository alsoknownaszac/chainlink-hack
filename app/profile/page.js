"use client"; // This is a client component 👈🏽
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Home() {
  const { userProfile, updateProfile } = useAuth();
  const [editedProfile, setProfile] = useState(userProfile);

  console.log(updateProfile);

  const saveProfile = () => {
    updateProfile(editedProfile);
  };

  return (
    <article className="card">
      <label htmlFor="address">
        Address
        <input
          type="text"
          id="address"
          name="address"
          defaultValue={userProfile?.address}
          placeholder="Address"
          disabled
        />
      </label>
      <div className="grid">
        <label htmlFor="username">
          Username
          <input
            type="username"
            id="username"
            name="username"
            defaultValue={userProfile?.username}
            onChange={(e) =>
              setProfile({ ...editedProfile, username: e.target.value })
            }
          />
        </label>
        <label htmlFor="name">
          Name
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Name"
            defaultValue={userProfile?.name}
            onChange={(e) =>
              setProfile({ ...editedProfile, name: e.target.value })
            }
          />
        </label>
        <label htmlFor="gender"> Select you gender</label>
      </div>
      <div>
        {" "}
        <select
          id="gender"
          name="gender"
          onChange={(e) =>
            setProfile({ ...editedProfile, gender: e.target.value })
          }
        >
          <option defaultValue="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">other</option>
        </select>
      </div>

      <div>
        <label htmlFor="info">Bio</label>
        <textarea
          id="info"
          name="info"
          placeholder="Your personal info"
          defaultValue={userProfile?.info}
          onChange={(e) =>
            setProfile({ ...editedProfile, info: e.target.value })
          }
        />
      </div>

      <button onClick={saveProfile}>Update Profile</button>
    </article>
  );
}
