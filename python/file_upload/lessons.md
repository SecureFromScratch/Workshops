# File Upload - prevent: verify, trust boundaries
When a user uploads a file, we have to make sure the file doesn't damage the application.

```skeleton basic file_upload step_0 ```

## Plot
In this lab we develop a content management system for recipes

# Preparations 
Run the Api and send requests with Postman
To read a recipe use get_recipe get method:
http://localhost:5000/get_recipe?recipe_file_name=cake.txt

To add a recipe, use add_recipe post method.

## Step 1
Complete the api post method. Save the recipe to the disk (step 1).

```solution step_1 ```

## Step 2
A benign user will put the file we expected.
A malicious user might put other files.
A malicious user might put an aspx or php web page with the functionality of her choice.
Allow file with txt extension only (step 2).

```solution step_2 ```

## Step 3
Validate the mime type (step 3)

```solution step_3 ```

## Step 4
Validate that the file is saved in a destination of your choice.
Hint: use secure_filename(step 4)

```solution step_4 ```

## Step 5
Make sure the uploaded file does not replace an exiting one (step 5).

```solution step_5 ```

## Summary
In this lesson, we've learned how to create a secure file upload in an api
In the next lesson we'll learn how to do the same in a form implemented with Jinja2 template
