Feature: Login Patient

Senario: Patient user register with valid credentials
Given a user with valid credantials
When the user enters valid credentials on `/auth/register`
Then the user should get a success message
