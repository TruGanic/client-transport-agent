import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { useSyncStore } from '../store/sync-store';

export default function SyncStatusIndicator() {
    const { isOnline, isSyncing, syncError } = useSyncStore();
    const insets = useSafeAreaInsets();

    // Animation for appearance
    const [translateY] = useState(new Animated.Value(-100)); // Start hidden above

    useEffect(() => {
        // Show if: Offline OR Syncing OR Error
        // Hide if: Online AND Not Syncing AND No Error (after a delay)
        const shouldShow = !isOnline || isSyncing || !!syncError;

        Animated.timing(translateY, {
            toValue: shouldShow ? 0 : -100,
            duration: 300,
            useNativeDriver: true,
        }).start();

    }, [isOnline, isSyncing, syncError]);

    if (isOnline && !isSyncing && !syncError) {
        // Return null to avoid rendering if hidden (though animation handles visual hiding)
        // But we want the animation to finish potentially. 
        // For simplicity, we keep it rendered but moved out of view via animation.
    }

    const getStatusColor = () => {
        if (!isOnline) return Colors.error; // Red for Offline
        if (syncError) return Colors.warning; // Yellow for Error
        if (isSyncing) return Colors.primary; // Blue for Syncing
        return Colors.success; // Green for Synced (rarely seen as we hide it)
    };

    const getStatusText = () => {
        if (!isOnline) return "You are Offline";
        if (syncError) return "Sync Failed. Retrying...";
        if (isSyncing) return "Syncing Data...";
        return "Synced";
    };

    const getIconName = () => {
        if (!isOnline) return "cloud-offline";
        if (syncError) return "alert-circle";
        if (isSyncing) return "sync";
        return "cloud-done";
    };

    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: insets.top + (Platform.OS === 'android' ? 10 : 0),
                left: 20,
                right: 20,
                zIndex: 9999,
                transform: [{ translateY }],
                backgroundColor: getStatusColor(),
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}
        >
            {isSyncing ? (
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
            ) : (
                <Ionicons name={getIconName() as any} size={18} color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                {getStatusText()}
            </Text>
        </Animated.View>
    );
}
