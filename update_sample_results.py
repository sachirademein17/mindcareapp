"""
Sample Test Results Updater - Demonstrates how to update test results in the Excel file
"""

import pandas as pd
from datetime import datetime
import os

def update_sample_test_results():
    # Find the latest test case file
    files = [f for f in os.listdir('.') if f.startswith('Mental_Health_Platform_Test_Cases_with_Results_')]
    if not files:
        print("No test case files found!")
        return
    
    latest_file = max(files)
    print(f"Updating sample results in: {latest_file}")
    
    # Read the existing Excel file
    with pd.ExcelWriter(latest_file, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
        # Read the main test cases
        df = pd.read_excel(latest_file, sheet_name='All_Test_Cases')
        
        # Update some sample test results
        sample_results = {
            'TC001': {'result': 'Pass', 'actual': 'User account created successfully, redirected to login', 'tester': 'QA Team', 'date': '2025-07-23'},
            'TC002': {'result': 'Pass', 'actual': 'Error message displayed correctly', 'tester': 'QA Team', 'date': '2025-07-23'},
            'TC003': {'result': 'Fail', 'actual': 'Form submission succeeded without validation', 'tester': 'QA Team', 'date': '2025-07-23', 'bug': 'BUG-001', 'comment': 'Client-side validation missing'},
            'TC004': {'result': 'Pass', 'actual': 'Login successful, redirected to dashboard', 'tester': 'QA Team', 'date': '2025-07-23'},
            'TC005': {'result': 'Pass', 'actual': 'Invalid credentials error shown', 'tester': 'QA Team', 'date': '2025-07-23'},
            'TC016': {'result': 'Pass', 'actual': 'Dashboard loaded with all components', 'tester': 'QA Team', 'date': '2025-07-23'},
            'TC020': {'result': 'Pass', 'actual': 'Doctor list displayed correctly', 'tester': 'QA Team', 'date': '2025-07-23'},
            'TC034': {'result': 'Pass', 'actual': 'Chat interface loaded with doctor list', 'tester': 'QA Team', 'date': '2025-07-23'},
            'TC041': {'result': 'Pass', 'actual': 'Prescriptions displayed with security measures', 'tester': 'QA Team', 'date': '2025-07-23'},
            'TC060': {'result': 'Pass', 'actual': 'API returned 201 with user object', 'tester': 'QA Team', 'date': '2025-07-23'},
            'TC080': {'result': 'Pass', 'actual': 'Application accessible from network devices', 'tester': 'QA Team', 'date': '2025-07-23'},
            'TC086': {'result': 'Blocked', 'actual': 'Security testing tools not available', 'tester': 'QA Team', 'date': '2025-07-23', 'comment': 'Waiting for security testing environment'},
        }
        
        # Update the dataframe
        for test_id, result_data in sample_results.items():
            mask = df['Test_Case_ID'] == test_id
            if mask.any():
                df.loc[mask, 'Test_Result'] = result_data['result']
                df.loc[mask, 'Actual_Result'] = result_data['actual']
                df.loc[mask, 'Tested_By'] = result_data['tester']
                df.loc[mask, 'Tested_Date'] = result_data['date']
                df.loc[mask, 'Bug_ID'] = result_data.get('bug', '')
                df.loc[mask, 'Comments'] = result_data.get('comment', '')
                df.loc[mask, 'Last_Updated'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Write updated main sheet
        df.to_excel(writer, sheet_name='All_Test_Cases', index=False)
        
        # Format the main sheet
        worksheet = writer.sheets['All_Test_Cases']
        
        # Set column widths for better readability
        column_widths = {
            'A': 12,  # Test_Case_ID
            'B': 20,  # Module
            'C': 40,  # Test_Case_Name
            'D': 15,  # Test_Type
            'E': 30,  # Preconditions
            'F': 50,  # Test_Steps
            'G': 40,  # Expected_Result
            'H': 10,  # Priority
            'I': 12,  # Status
            'J': 15,  # Platform
            'K': 20,  # Category
            'L': 15,  # Test_Result
            'M': 40,  # Actual_Result
            'N': 30,  # Comments
            'O': 15,  # Tested_By
            'P': 12,  # Tested_Date
            'Q': 10,  # Bug_ID
            'R': 12,  # Created_Date
            'S': 18   # Last_Updated
        }
        
        for col, width in column_widths.items():
            worksheet.column_dimensions[col].width = width
        
        # Update summary with new results
        modules = df['Module'].unique()
        summary_data = {
            'Module': [],
            'Total_Test_Cases': [],
            'High_Priority': [],
            'Medium_Priority': [],
            'Low_Priority': [],
            'Functional_Tests': [],
            'Security_Tests': [],
            'API_Tests': [],
            'Performance_Tests': [],
            'Passed': [],
            'Failed': [],
            'Not_Executed': [],
            'Blocked': [],
            'Pass_Rate': []
        }
        
        for module in modules:
            module_df = df[df['Module'] == module]
            total_tests = len(module_df)
            
            # Count by priority
            high_priority = len(module_df[module_df['Priority'] == 'High'])
            medium_priority = len(module_df[module_df['Priority'] == 'Medium'])
            low_priority = len(module_df[module_df['Priority'] == 'Low'])
            
            # Count by test type
            functional_tests = len(module_df[module_df['Test_Type'] == 'Functional'])
            security_tests = len(module_df[module_df['Test_Type'] == 'Security'])
            api_tests = len(module_df[module_df['Test_Type'] == 'API'])
            performance_tests = len(module_df[module_df['Test_Type'] == 'Performance'])
            
            # Count by test result
            passed = len(module_df[module_df['Test_Result'] == 'Pass'])
            failed = len(module_df[module_df['Test_Result'] == 'Fail'])
            not_executed = len(module_df[module_df['Test_Result'] == 'Not Executed'])
            blocked = len(module_df[module_df['Test_Result'] == 'Blocked'])
            
            # Calculate pass rate
            executed_tests = passed + failed
            pass_rate = (passed / executed_tests * 100) if executed_tests > 0 else 0
            
            summary_data['Module'].append(module)
            summary_data['Total_Test_Cases'].append(total_tests)
            summary_data['High_Priority'].append(high_priority)
            summary_data['Medium_Priority'].append(medium_priority)
            summary_data['Low_Priority'].append(low_priority)
            summary_data['Functional_Tests'].append(functional_tests)
            summary_data['Security_Tests'].append(security_tests)
            summary_data['API_Tests'].append(api_tests)
            summary_data['Performance_Tests'].append(performance_tests)
            summary_data['Passed'].append(passed)
            summary_data['Failed'].append(failed)
            summary_data['Not_Executed'].append(not_executed)
            summary_data['Blocked'].append(blocked)
            summary_data['Pass_Rate'].append(f"{pass_rate:.1f}%")
        
        summary_df = pd.DataFrame(summary_data)
        summary_df.to_excel(writer, sheet_name='Test_Summary', index=False)
        
        # Update dashboard
        dashboard_data = {
            'Metric': [
                'Total Test Cases',
                'High Priority Tests',
                'Medium Priority Tests', 
                'Low Priority Tests',
                'Tests Passed',
                'Tests Failed',
                'Tests Not Executed',
                'Tests Blocked',
                'Overall Pass Rate',
                'High Priority Pass Rate',
                'Security Tests Pass Rate',
                'API Tests Pass Rate',
                'Functional Tests Pass Rate'
            ],
            'Count': [
                len(df),
                len(df[df['Priority'] == 'High']),
                len(df[df['Priority'] == 'Medium']),
                len(df[df['Priority'] == 'Low']),
                len(df[df['Test_Result'] == 'Pass']),
                len(df[df['Test_Result'] == 'Fail']),
                len(df[df['Test_Result'] == 'Not Executed']),
                len(df[df['Test_Result'] == 'Blocked']),
                f"{(len(df[df['Test_Result'] == 'Pass']) / max(1, len(df[df['Test_Result'].isin(['Pass', 'Fail'])])) * 100):.1f}%",
                f"{(len(df[(df['Priority'] == 'High') & (df['Test_Result'] == 'Pass')]) / max(1, len(df[(df['Priority'] == 'High') & (df['Test_Result'].isin(['Pass', 'Fail']))])) * 100):.1f}%",
                f"{(len(df[(df['Test_Type'] == 'Security') & (df['Test_Result'] == 'Pass')]) / max(1, len(df[(df['Test_Type'] == 'Security') & (df['Test_Result'].isin(['Pass', 'Fail']))])) * 100):.1f}%",
                f"{(len(df[(df['Test_Type'] == 'API') & (df['Test_Result'] == 'Pass')]) / max(1, len(df[(df['Test_Type'] == 'API') & (df['Test_Result'].isin(['Pass', 'Fail']))])) * 100):.1f}%",
                f"{(len(df[(df['Test_Type'] == 'Functional') & (df['Test_Result'] == 'Pass')]) / max(1, len(df[(df['Test_Type'] == 'Functional') & (df['Test_Result'].isin(['Pass', 'Fail']))])) * 100):.1f}%"
            ],
            'Target': [
                '100',
                '58',
                '39',
                '3',
                '95%',
                '<5%',
                '0',
                '0',
                '>95%',
                '>98%',
                '>99%',
                '>95%',
                '>90%'
            ]
        }
        
        dashboard_df = pd.DataFrame(dashboard_data)
        dashboard_df.to_excel(writer, sheet_name='Test_Dashboard', index=False)
        
    print(f"✅ Sample test results updated!")
    print(f"📊 Results Summary:")
    
    # Print summary of updated results
    passed_count = len(df[df['Test_Result'] == 'Pass'])
    failed_count = len(df[df['Test_Result'] == 'Fail'])
    blocked_count = len(df[df['Test_Result'] == 'Blocked'])
    not_executed_count = len(df[df['Test_Result'] == 'Not Executed'])
    
    print(f"   • Passed: {passed_count}")
    print(f"   • Failed: {failed_count}")
    print(f"   • Blocked: {blocked_count}")
    print(f"   • Not Executed: {not_executed_count}")
    
    if passed_count + failed_count > 0:
        pass_rate = (passed_count / (passed_count + failed_count)) * 100
        print(f"   • Pass Rate: {pass_rate:.1f}%")

if __name__ == "__main__":
    update_sample_test_results()
