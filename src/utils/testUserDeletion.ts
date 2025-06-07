/**
 * Test utility for user deletion functionality
 * This file contains functions to test the admin user deletion features
 */

import { 
  deleteUserCompletely, 
  deactivateUser, 
  reactivateUser, 
  getUserDeletionInfo,
  logAdminAction 
} from '@/services/adminService';
import { supabase } from '@/lib/supabaseClient';

// Test data interface
interface TestUser {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'lecturer' | 'dean' | 'admin';
}

/**
 * Create a test user for deletion testing
 */
export const createTestUser = async (): Promise<TestUser | null> => {
  try {
    const testEmail = `test-user-${Date.now()}@mmu.ac.ke`;
    const testUser = {
      auth_id: `test-auth-${Date.now()}`,
      email: testEmail,
      full_name: 'Test User for Deletion',
      role: 'student' as const,
      faculty: 'Test Faculty',
      department: 'Test Department',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();

    if (error) {
      console.error('Error creating test user:', error);
      return null;
    }

    console.log('✅ Test user created:', data);
    return data as TestUser;
  } catch (error) {
    console.error('Error in createTestUser:', error);
    return null;
  }
};

/**
 * Test the getUserDeletionInfo function
 */
export const testGetDeletionInfo = async (userId: string) => {
  try {
    console.log('🔍 Testing getUserDeletionInfo...');
    const info = await getUserDeletionInfo(userId);
    
    if (info) {
      console.log('✅ Deletion info retrieved:', {
        user: info.user.full_name,
        email: info.user.email,
        relatedData: info.relatedData
      });
      return info;
    } else {
      console.log('❌ No deletion info found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing deletion info:', error);
    return null;
  }
};

/**
 * Test user deactivation
 */
export const testUserDeactivation = async (userId: string) => {
  try {
    console.log('🔄 Testing user deactivation...');
    const result = await deactivateUser(userId);
    
    if (result.success) {
      console.log('✅ User deactivated successfully');
      
      // Verify the user is actually deactivated
      const { data } = await supabase
        .from('users')
        .select('is_active')
        .eq('id', userId)
        .single();
      
      if (data && !data.is_active) {
        console.log('✅ User status verified as inactive');
      } else {
        console.log('❌ User status not updated correctly');
      }
      
      return true;
    } else {
      console.log('❌ Deactivation failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing deactivation:', error);
    return false;
  }
};

/**
 * Test user reactivation
 */
export const testUserReactivation = async (userId: string) => {
  try {
    console.log('🔄 Testing user reactivation...');
    const result = await reactivateUser(userId);
    
    if (result.success) {
      console.log('✅ User reactivated successfully');
      
      // Verify the user is actually reactivated
      const { data } = await supabase
        .from('users')
        .select('is_active')
        .eq('id', userId)
        .single();
      
      if (data && data.is_active) {
        console.log('✅ User status verified as active');
      } else {
        console.log('❌ User status not updated correctly');
      }
      
      return true;
    } else {
      console.log('❌ Reactivation failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing reactivation:', error);
    return false;
  }
};

/**
 * Test complete user deletion
 */
export const testUserDeletion = async (userId: string) => {
  try {
    console.log('🗑️ Testing complete user deletion...');
    const result = await deleteUserCompletely(userId);
    
    if (result.success) {
      console.log('✅ User deleted successfully');
      
      // Verify the user is actually deleted
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (!data) {
        console.log('✅ User deletion verified - user not found in database');
      } else {
        console.log('❌ User still exists in database');
      }
      
      return true;
    } else {
      console.log('❌ Deletion failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing deletion:', error);
    return false;
  }
};

/**
 * Run all deletion tests
 */
export const runDeletionTests = async () => {
  console.log('🧪 Starting User Deletion Tests...\n');
  
  // Create test user
  const testUser = await createTestUser();
  if (!testUser) {
    console.log('❌ Failed to create test user. Aborting tests.');
    return;
  }
  
  console.log('\n--- Test Results ---');
  
  // Test 1: Get deletion info
  await testGetDeletionInfo(testUser.id);
  
  // Test 2: Deactivate user
  const deactivated = await testUserDeactivation(testUser.id);
  
  // Test 3: Reactivate user (if deactivation worked)
  if (deactivated) {
    await testUserReactivation(testUser.id);
  }
  
  // Test 4: Complete deletion
  await testUserDeletion(testUser.id);
  
  console.log('\n🏁 All tests completed!');
};

/**
 * Test admin action logging
 */
export const testAdminLogging = async (adminId: string) => {
  try {
    console.log('📝 Testing admin action logging...');
    
    await logAdminAction(
      adminId,
      'test_action',
      'test-target-user',
      { test: true, timestamp: new Date().toISOString() }
    );
    
    console.log('✅ Admin action logged successfully');
    return true;
  } catch (error) {
    console.error('❌ Error testing admin logging:', error);
    return false;
  }
};

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testUserDeletion = {
    createTestUser,
    testGetDeletionInfo,
    testUserDeactivation,
    testUserReactivation,
    testUserDeletion,
    runDeletionTests,
    testAdminLogging
  };
  
  console.log('🧪 User deletion test functions available in window.testUserDeletion');
}
